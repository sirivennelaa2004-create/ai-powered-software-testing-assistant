import json
import re
from typing import Type, TypeVar, Any
from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


def extract_json_string(raw_text: str) -> str:
    """
    Extract raw JSON content from text, handling markdown blocks or surrounding prose.
    """
    if not raw_text:
        return ""

    # Strip whitespace
    text = raw_text.strip()

    # Match ```json ... ``` or ``` ... ```
    pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return match.group(1).strip()

    # Otherwise try finding first '{' or '[' and last '}' or ']'
    start_brace = text.find("{")
    start_bracket = text.find("[")

    if start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket):
        end_brace = text.rfind("}")
        if end_brace != -1 and end_brace > start_brace:
            return text[start_brace : end_brace + 1]
    elif start_bracket != -1:
        end_bracket = text.rfind("]")
        if end_bracket != -1 and end_bracket > start_bracket:
            return text[start_bracket : end_bracket + 1]

    return text


def repair_json_string(json_str: str) -> str:
    """
    Perform common JSON repair steps like fixing trailing commas.
    """
    # Remove trailing commas in objects and arrays
    repaired = re.sub(r",\s*([}\]])", r"\1", json_str)
    return repaired


def parse_and_validate(raw_text: str, target_model: Type[T]) -> T:
    """
    Attempt safe parsing of raw AI string into a target Pydantic model.
    1. Extract JSON block
    2. Attempt standard json.loads
    3. If failed, attempt repair_json_string
    4. Validate against Pydantic target_model
    """
    json_candidate = extract_json_string(raw_text)

    parsed_dict: Any = None
    try:
        parsed_dict = json.loads(json_candidate)
    except json.JSONDecodeError:
        # Attempt repair
        try:
            repaired = repair_json_string(json_candidate)
            parsed_dict = json.loads(repaired)
        except Exception as err:
            raise ValueError(f"Failed to parse AI output into JSON: {err}. Raw output was: {raw_text[:200]}")

    if isinstance(parsed_dict, list) and not issubclass(target_model, list):
        # If target model expects a wrapper dict
        fields = target_model.model_fields
        first_field_name = list(fields.keys())[0] if fields else "data"
        parsed_dict = {first_field_name: parsed_dict}

    try:
        return target_model.model_validate(parsed_dict)
    except ValidationError as val_err:
        raise ValueError(f"AI response failed schema validation for {target_model.__name__}: {val_err}")
