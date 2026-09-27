import json
from typing import Dict, Any
from app.ai.base import BaseAIProvider


class MockAIProvider(BaseAIProvider):
    """
    High-quality mock AI provider for testing and zero-token offline execution.
    Generates dynamic, realistic testing output based on prompt inspection.
    """

    async def complete_prompt(self, prompt: str, system_message: str = "") -> Dict[str, Any]:
        prompt_lower = prompt.lower()

        if "quality_score" in prompt_lower or "test case title" in prompt_lower and "audit" in prompt_lower:
            response_obj = {
                "quality_score": 88,
                "issues": [
                    "Precondition lacks explicit database state definition.",
                    "Expected result could specify exact HTTP status code.",
                ],
                "suggestions": [
                    "Define exact user credentials format in test data.",
                    "Include step for verifying response header Content-Type.",
                ],
                "improved_test_case": {
                    "custom_id": "TC-OPT-01",
                    "title": "Verify Login Response Status and JWT Token Payload",
                    "objective": "Ensure valid user login returns 200 OK and valid JWT token payload.",
                    "preconditions": "Active user registered with email tester@example.com and password Secret123!",
                    "test_data": "Email: tester@example.com, Password: Secret123!",
                    "steps": [
                        "1. Send POST request to /api/v1/auth/login with valid JSON payload",
                        "2. Inspect HTTP status code",
                        "3. Validate access_token field in response JSON body",
                    ],
                    "expected_result": "Status code 200 OK returned; access_token is a non-empty JWT string.",
                    "test_type": "Positive",
                    "priority": "P1",
                    "severity": "High",
                    "category": "Authentication",
                },
            }
        elif "possible_root_causes" in prompt_lower or "deep_bug_analysis" in prompt_lower:
            response_obj = {
                "possible_root_causes": [
                    "Unhandled null check on optional payload field in request handler.",
                    "Race condition in database transaction session cleanup.",
                    "JWT token expiration calculation using mismatched timezone offset.",
                ],
                "suggested_severity": "High",
                "suggested_priority": "P1",
                "affected_area": "Authentication & Session Management Service",
                "missing_information": [
                    "Server error log stack trace at timestamp of failure.",
                    "User agent header and client browser environment.",
                ],
                "reproduction_quality": "High - Clear step-by-step reproduction instructions provided",
                "additional_debugging_questions": [
                    "Does the failure occur for all user roles or specific permissions?",
                    "Is database connection pool leaking active connections?",
                ],
                "recommended_next_testing_steps": [
                    "Execute automated regression suite on login endpoints.",
                    "Inspect token expiration claims in decoded JWT.",
                    "Perform load test under concurrent user authentication.",
                ],
            }
        elif "functional_requirements" in prompt_lower or "analyze the following software requirement" in prompt_lower:
            response_obj = {
                "functional_requirements": [
                    "User must provide valid email format and minimum password length.",
                    "System must authenticate credentials against stored hash.",
                    "System must issue JWT token on successful login.",
                ],
                "possible_assumptions": [
                    "Email addresses are case-insensitive.",
                    "User account is active and verified prior to login.",
                ],
                "missing_information": [
                    "Password retry rate-limiting threshold (e.g. 5 failed attempts lockout).",
                    "Password reset workflow link integration.",
                ],
                "testable_conditions": [
                    "Successful login with valid credentials.",
                    "Failed login with incorrect password.",
                    "Failed login with unregistered email.",
                    "Token expiration validation.",
                ],
                "risks": [
                    "Potential brute-force vulnerability if rate limiting is absent.",
                    "Security risk if cleartext passwords are logged.",
                ],
                "important_validation_points": [
                    "Validate HTTP status 200 vs 401 response codes.",
                    "Verify token payload contains correct subject user ID.",
                ],
            }
        elif "scenarios" in prompt_lower and "scenario_type" in prompt_lower:
            response_obj = {
                "scenarios": [
                    {
                        "title": "Valid credential authentication",
                        "description": "User enters correct email and password and submits form.",
                        "scenario_type": "Positive",
                    },
                    {
                        "title": "Invalid password submission",
                        "description": "User enters registered email with wrong password.",
                        "scenario_type": "Negative",
                    },
                    {
                        "title": "Malformed email format validation",
                        "description": "User enters text without @ domain indicator.",
                        "scenario_type": "Validation",
                    },
                    {
                        "title": "SQL injection attack payload in input",
                        "description": "User attempts SQL injection payload in username field.",
                        "scenario_type": "Security",
                    },
                    {
                        "title": "Boundary maximum length email string",
                        "description": "User enters 255 character email string.",
                        "scenario_type": "Boundary",
                    },
                    {
                        "title": "Empty field submit handling",
                        "description": "User submits login form with empty inputs.",
                        "scenario_type": "Edge Case",
                    },
                ]
            }
        elif "target_focus" in prompt_lower and "negative" in prompt_lower:
            response_obj = {
                "test_cases": [
                    {
                        "custom_id": "TC-NEG-01",
                        "title": "Verify login rejection with incorrect password",
                        "objective": "Ensure 401 Unauthorized returned when password does not match.",
                        "preconditions": "Registered user exists in database",
                        "test_data": "Email: tester@example.com, Password: WrongPassword123!",
                        "steps": ["Submit login payload with incorrect password"],
                        "expected_result": "Status 401 Unauthorized with detail message 'Invalid email or password.'",
                        "test_type": "Negative",
                        "priority": "P1",
                        "severity": "High",
                        "category": "Authentication",
                    },
                    {
                        "custom_id": "TC-NEG-02",
                        "title": "Verify login rejection with non-existent user email",
                        "objective": "Ensure authentication fails cleanly for unregistered email.",
                        "preconditions": "Email unknown@example.com does not exist in DB",
                        "test_data": "Email: unknown@example.com, Password: AnyPassword123!",
                        "steps": ["Submit login request for unregistered email"],
                        "expected_result": "Status 401 Unauthorized returned without leaking account existence details.",
                        "test_type": "Negative",
                        "priority": "P1",
                        "severity": "High",
                        "category": "Authentication",
                    },
                ]
            }
        elif "target_focus" in prompt_lower and "edge" in prompt_lower:
            response_obj = {
                "test_cases": [
                    {
                        "custom_id": "TC-EDGE-01",
                        "title": "Verify login behavior when user email contains uppercase characters",
                        "objective": "Verify email normalization during authentication.",
                        "preconditions": "User registered as tester@example.com",
                        "test_data": "Email: TESTER@EXAMPLE.COM, Password: Password123!",
                        "steps": ["Submit login with uppercase email string"],
                        "expected_result": "Status 200 OK returned (email treated case-insensitively).",
                        "test_type": "Edge Case",
                        "priority": "P2",
                        "severity": "Medium",
                        "category": "Edge Case",
                    }
                ]
            }
        elif "target_focus" in prompt_lower and "boundary" in prompt_lower:
            response_obj = {
                "test_cases": [
                    {
                        "custom_id": "TC-BND-01",
                        "title": "Verify login with 255 character maximum email string length",
                        "objective": "Test system boundary handling for maximum allowed email length.",
                        "preconditions": "System running normally",
                        "test_data": f"Email: {'a'*200}@example.com, Password: Password123!",
                        "steps": ["Submit login with 255 character email"],
                        "expected_result": "System validates input boundary without crashing.",
                        "test_type": "Boundary",
                        "priority": "P2",
                        "severity": "Medium",
                        "category": "Boundary Analysis",
                    }
                ]
            }
        elif "test_cases" in prompt_lower and "expected_result" in prompt_lower:
            response_obj = {
                "test_cases": [
                    {
                        "custom_id": "TC-001",
                        "title": "Verify successful login with valid credentials",
                        "objective": "Ensure authorized user can acquire JWT token and access protected resources.",
                        "preconditions": "User account exists in database with email tester@example.com",
                        "test_data": "Email: tester@example.com, Password: SecretPassword123!",
                        "steps": [
                            "Navigate to login endpoint or page",
                            "Enter email and password",
                            "Click login button / Submit POST payload",
                        ],
                        "expected_result": "Status 200 OK returned with access_token JWT and token_type bearer.",
                        "test_type": "Positive",
                        "priority": "P0",
                        "severity": "Critical",
                        "category": "Authentication",
                    },
                    {
                        "custom_id": "TC-002",
                        "title": "Verify login rejection with incorrect password",
                        "objective": "Ensure authentication fails cleanly with 401 Unauthorized when password is wrong.",
                        "preconditions": "User account exists in database",
                        "test_data": "Email: tester@example.com, Password: WrongPassword!",
                        "steps": [
                            "Submit login payload with incorrect password",
                        ],
                        "expected_result": "Status 401 Unauthorized returned with clear error message 'Invalid credentials'.",
                        "test_type": "Negative",
                        "priority": "P1",
                        "severity": "High",
                        "category": "Authentication",
                    },
                ]
            }
        else:
            response_obj = {
                "root_cause_analysis": "The bug is likely caused by an unhandled NullPointer or missing transaction rollback.",
                "suggested_severity": "High",
                "suggested_priority": "P1",
                "recommended_fix_steps": ["Check non-null validations", "Add unit tests"],
                "additional_test_recommendations": ["Run regression tests"],
            }

        raw_str = json.dumps(response_obj)
        return {"raw_response": raw_str, "tokens_used": 150}
