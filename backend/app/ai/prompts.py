REQUIREMENT_ANALYSIS_PROMPT = """
You are an expert QA and Software Testing Specialist.
Analyze the following software requirement in detail and return structured JSON only.

REQUIREMENT TITLE: {title}
REQUIREMENT DESCRIPTION: {description}

Return a valid JSON object matching this schema:
{{
  "functional_requirements": ["string list of explicit functional rules"],
  "possible_assumptions": ["string list of implicit assumptions made by the requirement"],
  "missing_information": ["string list of ambiguous or missing specifications"],
  "testable_conditions": ["string list of testable conditions"],
  "risks": ["string list of architectural or user risks"],
  "important_validation_points": ["string list of key validation rules"]
}}

DO NOT wrap output in extra text outside the JSON. Return valid JSON only.
"""

GENERATE_SCENARIOS_PROMPT = """
You are a Lead QA Automation & Manual Engineer.
Generate comprehensive test scenarios for the given requirement covering positive, negative, edge cases, boundary conditions, and security aspects.

REQUIREMENT TITLE: {title}
REQUIREMENT DESCRIPTION: {description}

Return a valid JSON object matching this schema:
{{
  "scenarios": [
    {{
      "title": "Scenario Title",
      "description": "Scenario detail description",
      "scenario_type": "Positive" // choices: Positive, Negative, Edge Case, Boundary, Security, Validation
    }}
  ]
}}

Ensure you generate at least 4 to 6 diverse, high-quality test scenarios.
Return valid JSON only.
"""

GENERATE_TEST_CASES_PROMPT = """
You are a Senior Test Engineer.
Generate structured test cases for the following requirement and scenario.
Specific Test Focus Target: {target_focus} (e.g. All, Positive, Negative, Edge Case, Boundary)

REQUIREMENT TITLE: {req_title}
REQUIREMENT DESCRIPTION: {req_description}
SCENARIO TITLE: {scenario_title}
SCENARIO TYPE: {scenario_type}

Instructions:
- Avoid duplicate test cases.
- Clearly state inputs and preconditions.
- Do not invent application behavior not implied by requirement.
- Set test_type to target focus (Positive, Negative, Boundary, Edge Case, etc.).

Return a valid JSON object matching this schema:
{{
  "test_cases": [
    {{
      "custom_id": "TC-001",
      "title": "Clear Test Case Title",
      "objective": "What this test case proves",
      "preconditions": "Required setup state",
      "test_data": "Input data required",
      "steps": ["Step 1...", "Step 2...", "Step 3..."],
      "expected_result": "Exact expected outcome",
      "test_type": "Functional", // Positive, Negative, Boundary, Edge Case, Validation, Security
      "priority": "P1", // P0, P1, P2, P3
      "severity": "High", // Critical, High, Medium, Low
      "category": "Functional"
    }}
  ]
}}

Return valid JSON only.
"""

BUG_ANALYSIS_PROMPT = """
You are an AI Debugging & Root Cause Analysis Specialist.
Analyze the following bug report logged by a QA tester.

BUG TITLE: {title}
BUG DESCRIPTION: {description}
STEPS TO REPRODUCE: {steps}
EXPECTED RESULT: {expected_result}
ACTUAL RESULT: {actual_result}
ENVIRONMENT: {environment}

Return a valid JSON object matching this schema:
{{
  "root_cause_analysis": "Detailed technical analysis of why this bug is likely occurring",
  "suggested_severity": "High", // Critical, High, Medium, Low
  "suggested_priority": "P1", // P0, P1, P2, P3
  "recommended_fix_steps": ["Step 1 to fix in code or DB", "Step 2..."],
  "additional_test_recommendations": ["Regression test suggestion 1", "Regression test suggestion 2"]
}}

Return valid JSON only.
"""

DEEP_BUG_ANALYSIS_PROMPT = """
You are a Senior Debugging & Quality Engineer AI Assistant.
Perform a thorough technical analysis of the logged bug report.

BUG TITLE: {title}
BUG DESCRIPTION: {description}
STEPS TO REPRODUCE: {steps}
EXPECTED RESULT: {expected_result}
ACTUAL RESULT: {actual_result}
ENVIRONMENT: {environment}

Guidelines:
- Present root cause findings strictly as probable technical hypotheses ("possible_root_causes").
- Evaluate the quality and completeness of reproduction steps.
- Suggest appropriate severity (Critical, High, Medium, Low) and priority (P0, P1, P2, P3).

Return a valid JSON object matching this schema:
{{
  "possible_root_causes": ["Hypothesis 1...", "Hypothesis 2..."],
  "suggested_severity": "High",
  "suggested_priority": "P1",
  "affected_area": "Backend / Authentication Service",
  "missing_information": ["Missing server log snippet...", "Browser version..."],
  "reproduction_quality": "High - Clear step-by-step reproduction instructions provided",
  "additional_debugging_questions": ["Does the issue occur under anonymous session?", "Is DB transaction committing?"],
  "recommended_next_testing_steps": ["Run regression tests on auth endpoints", "Inspect token expiration logic"]
}}

Return valid JSON only.
"""

TEST_CASE_QUALITY_PROMPT = """
You are an Expert Software Test Audit AI.
Audit the following test case for clarity, coverage, completeness, and precision.

TEST CASE TITLE: {title}
OBJECTIVE: {objective}
PRECONDITIONS: {preconditions}
TEST DATA: {test_data}
STEPS: {steps}
EXPECTED RESULT: {expected_result}
TEST TYPE: {test_type}
PRIORITY: {priority}

Evaluate:
- Are preconditions or test data missing/vague?
- Are steps clear, numbered, and reproducible?
- Is the expected result verifiable?
- Are there missing negative or edge case coverage angles?

Return a valid JSON object matching this schema:
{{
  "quality_score": 85, // Integer score from 0 to 100 representing AI quality evaluation
  "issues": ["Precondition lacks specific initial database state", "Expected result is slightly ambiguous"],
  "suggestions": ["Specify exact email string format in test_data", "Add explicit HTTP status code check"],
  "improved_test_case": {{
    "custom_id": "TC-001",
    "title": "Refined Test Case Title",
    "objective": "Clear objective",
    "preconditions": "Exact preconditions",
    "test_data": "Exact test data",
    "steps": ["Step 1...", "Step 2..."],
    "expected_result": "Precise expected result",
    "test_type": "Positive",
    "priority": "P1",
    "severity": "Medium",
    "category": "Functional"
  }}
}}

Return valid JSON only.
"""
