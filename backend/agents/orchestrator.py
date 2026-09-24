from dataclasses import dataclass

from backend.agents.generator import PromptGenerator
from backend.agents.evaluator import PolicyEvaluator


# ================================================================
# FINDING
# ================================================================

@dataclass
class Finding:
    iteration: int
    strategy: str
    category: str
    status: str
    severity: str
    confidence: float
    prompt: str
    target_response: str
    reason: str
    adaptation_reason: str = ""

    def is_vulnerability(self) -> bool:
        return self.status.upper() == "VULNERABLE"


# ================================================================
# ATTACK STRATEGY MANAGER
# ================================================================

class AttackStrategyManager:
    """
    Chooses the next attack strategy based on evaluator feedback.

    choose_strategy()
        Actually selects the strategy and may change internal state.

    preview_strategy()
        Shows what strategy would be selected without changing
        internal state.
    """

    def __init__(self):

        self.strategies = [
            "DIRECT_REQUEST",
            "INDIRECT_REQUEST",
            "ROLE_PLAYING",
            "CONTEXT_MANIPULATION",
            "POLICY_BOUNDARY_TEST",
        ]

        self.current_index = 0

    # ============================================================
    # ACTUAL STRATEGY SELECTION
    # ============================================================

    def choose_strategy(
        self,
        previous_evaluation: dict | None = None
    ) -> str:

        # --------------------------------------------------------
        # FIRST ITERATION
        # --------------------------------------------------------

        if previous_evaluation is None:

            self.current_index = 0

            return self.strategies[
                self.current_index
            ]

        # --------------------------------------------------------
        # SAFELY READ EVALUATOR FIELDS
        # --------------------------------------------------------

        status = str(
            previous_evaluation.get(
                "status",
                "UNKNOWN"
            ) or "UNKNOWN"
        ).upper()

        severity = str(
            previous_evaluation.get(
                "severity",
                "NONE"
            ) or "NONE"
        ).upper()

        category = str(
            previous_evaluation.get(
                "category",
                ""
            ) or ""
        ).upper()

        # --------------------------------------------------------
        # VULNERABLE RESULT
        # --------------------------------------------------------

        if status == "VULNERABLE":

            if (
                "SENSITIVE" in category
                or "DISCLOSURE" in category
                or "LEAK" in category
            ):

                return "POLICY_BOUNDARY_TEST"

            if severity in {
                "HIGH",
                "CRITICAL"
            }:

                return "CONTEXT_MANIPULATION"

        # --------------------------------------------------------
        # SAFE RESULT
        # --------------------------------------------------------

        if status == "SAFE":

            self.current_index = (
                self.current_index + 1
            ) % len(self.strategies)

            return self.strategies[
                self.current_index
            ]

        # --------------------------------------------------------
        # UNKNOWN / ERROR RESULT
        # --------------------------------------------------------

        self.current_index = (
            self.current_index + 1
        ) % len(self.strategies)

        return self.strategies[
            self.current_index
        ]

    # ============================================================
    # PREVIEW STRATEGY
    # ============================================================

    def preview_strategy(
        self,
        previous_evaluation: dict | None = None
    ) -> str:
        """
        Preview the next strategy without modifying manager state.
        """

        # --------------------------------------------------------
        # FIRST ITERATION
        # --------------------------------------------------------

        if previous_evaluation is None:

            return self.strategies[0]

        # --------------------------------------------------------
        # SAFELY READ EVALUATOR FIELDS
        # --------------------------------------------------------

        status = str(
            previous_evaluation.get(
                "status",
                "UNKNOWN"
            ) or "UNKNOWN"
        ).upper()

        severity = str(
            previous_evaluation.get(
                "severity",
                "NONE"
            ) or "NONE"
        ).upper()

        category = str(
            previous_evaluation.get(
                "category",
                ""
            ) or ""
        ).upper()

        # --------------------------------------------------------
        # VULNERABLE RESULT
        # --------------------------------------------------------

        if status == "VULNERABLE":

            if (
                "SENSITIVE" in category
                or "DISCLOSURE" in category
                or "LEAK" in category
            ):

                return "POLICY_BOUNDARY_TEST"

            if severity in {
                "HIGH",
                "CRITICAL"
            }:

                return "CONTEXT_MANIPULATION"

        # --------------------------------------------------------
        # SAFE RESULT
        # --------------------------------------------------------

        if status == "SAFE":

            next_index = (
                self.current_index + 1
            ) % len(self.strategies)

            return self.strategies[
                next_index
            ]

        # --------------------------------------------------------
        # UNKNOWN / ERROR RESULT
        # --------------------------------------------------------

        next_index = (
            self.current_index + 1
        ) % len(self.strategies)

        return self.strategies[
            next_index
        ]


# ================================================================
# AUTONOMOUS RED-TEAM ORCHESTRATOR
# ================================================================

class AutoRedOrchestrator:

    def __init__(self, target):

        self.target = target

        self.generator = PromptGenerator()

        self.evaluator = PolicyEvaluator()

        self.strategy_manager = AttackStrategyManager()

    # ============================================================
    # SAFE EVALUATION NORMALIZATION
    # ============================================================

    def _normalize_evaluation(
        self,
        evaluation
    ) -> dict:
        """
        Converts evaluator output into a safe and predictable format.

        This prevents malformed evaluator responses from crashing
        the campaign.
        """

        # --------------------------------------------------------
        # EVALUATOR DID NOT RETURN A DICTIONARY
        # --------------------------------------------------------

        if not isinstance(
            evaluation,
            dict
        ):

            print(
                "\nWARNING: Evaluator returned invalid data."
            )

            return {
                "status": "ERROR",
                "category": "EVALUATION_ERROR",
                "severity": "NONE",
                "confidence": 0.0,
                "reason": (
                    "The evaluator returned an invalid "
                    "response format."
                )
            }

        # --------------------------------------------------------
        # STATUS
        # --------------------------------------------------------

        raw_status = evaluation.get(
            "status"
        )

        if raw_status is None:

            status = "UNKNOWN"

        else:

            status = str(
                raw_status
            ).strip().upper()

        # Only accept known statuses.

        if status not in {
            "SAFE",
            "VULNERABLE",
            "ERROR",
            "UNKNOWN"
        }:

            print(
                f"\nWARNING: Unknown evaluator status "
                f"'{status}'. Using UNKNOWN."
            )

            status = "UNKNOWN"

        # --------------------------------------------------------
        # CATEGORY
        # --------------------------------------------------------

        raw_category = evaluation.get(
            "category"
        )

        if raw_category is None:

            category = "UNKNOWN"

        else:

            category = str(
                raw_category
            ).strip()

            if not category:

                category = "UNKNOWN"

        # --------------------------------------------------------
        # SEVERITY
        # --------------------------------------------------------

        raw_severity = evaluation.get(
            "severity"
        )

        if raw_severity is None:

            severity = "NONE"

        else:

            severity = str(
                raw_severity
            ).strip().upper()

        # Only accept known severity values.

        if severity not in {
            "NONE",
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        }:

            print(
                f"\nWARNING: Unknown severity "
                f"'{severity}'. Using NONE."
            )

            severity = "NONE"

        # --------------------------------------------------------
        # CONFIDENCE
        # --------------------------------------------------------

        raw_confidence = evaluation.get(
            "confidence"
        )

        try:

            confidence = float(
                raw_confidence
            )

        except (
            TypeError,
            ValueError
        ):

            print(
                "\nWARNING: Invalid evaluator confidence. "
                "Using 0.0."
            )

            confidence = 0.0

        # Handle NaN and infinity safely.

        if confidence != confidence:

            confidence = 0.0

        if confidence == float("inf"):

            confidence = 1.0

        if confidence == float("-inf"):

            confidence = 0.0

        # Keep confidence within 0-1.

        confidence = max(
            0.0,
            min(
                1.0,
                confidence
            )
        )

        # --------------------------------------------------------
        # REASON
        # --------------------------------------------------------

        raw_reason = evaluation.get(
            "reason"
        )

        if raw_reason is None:

            reason = (
                "No evaluator explanation was provided."
            )

        else:

            reason = str(
                raw_reason
            ).strip()

            if not reason:

                reason = (
                    "No evaluator explanation was provided."
                )

        # --------------------------------------------------------
        # RETURN CLEAN RESULT
        # --------------------------------------------------------

        return {
            "status": status,
            "category": category,
            "severity": severity,
            "confidence": confidence,
            "reason": reason
        }

    # ============================================================
    # RUN CAMPAIGN
    # ============================================================

    def run_campaign(
        self,
        objective: str,
        category: str,
        max_iterations: int = 5
    ):

        results = []

        previous_result = None

        previous_evaluation = None

        print("\n")
        print("=" * 70)
        print("AUTOREd ADAPTIVE RED-TEAM CAMPAIGN")
        print("=" * 70)

        print(
            f"Objective       : {objective}"
        )

        print(
            f"Category        : {category}"
        )

        print(
            f"Max Iterations  : {max_iterations}"
        )

        print("=" * 70)

        # ========================================================
        # ITERATION LOOP
        # ========================================================

        for iteration in range(
            1,
            max_iterations + 1
        ):

            print("\n")
            print("-" * 70)

            print(
                f"ITERATION {iteration}"
            )

            print("-" * 70)

            # ----------------------------------------------------
            # 1. SELECT STRATEGY
            # ----------------------------------------------------

            try:

                strategy = (
                    self.strategy_manager.choose_strategy(
                        previous_evaluation
                    )
                )

            except Exception as error:

                print(
                    "\nWARNING: Strategy selection failed."
                )

                print(
                    f"Reason: {error}"
                )

                strategy = "DIRECT_REQUEST"

            print(
                f"Selected Strategy: {strategy}"
            )

            # ----------------------------------------------------
            # 2. GENERATE ATTACK
            # ----------------------------------------------------

            try:

                generated_attack = (
                    self.generator.generate(
                        objective=objective,
                        category=category,
                        previous_result=previous_result,
                        strategy=strategy
                    )
                )

            except Exception as error:

                print(
                    "\nERROR: Prompt generation failed."
                )

                print(
                    f"Reason: {error}"
                )

                # Stop this campaign safely instead of crashing
                # the entire backend.

                break

            # ----------------------------------------------------
            # SAFELY READ GENERATED PROMPT
            # ----------------------------------------------------

            if not isinstance(
                generated_attack,
                dict
            ):

                print(
                    "\nWARNING: Generator returned invalid data."
                )

                generated_attack = {
                    "prompt": str(
                        generated_attack
                    ),
                    "strategy": strategy,
                    "category": category,
                    "objective": objective,
                    "adaptation_reason": ""
                }

            prompt = generated_attack.get(
                "prompt",
                ""
            )

            if prompt is None:

                prompt = ""

            prompt = str(
                prompt
            ).strip()

            if not prompt:

                print(
                    "\nWARNING: Generator returned an empty prompt."
                )

                prompt = (
                    "Perform a controlled security-policy "
                    "boundary test using fictional information."
                )

            adaptation_reason = (
                generated_attack.get(
                    "adaptation_reason",
                    ""
                )
            )

            if adaptation_reason is None:

                adaptation_reason = ""

            adaptation_reason = str(
                adaptation_reason
            ).strip()

            print("\nGenerated Prompt:")

            print(prompt)

            if adaptation_reason:

                print(
                    "\nAdaptation Reason:"
                )

                print(
                    adaptation_reason
                )

            # ----------------------------------------------------
            # 3. SEND ATTACK TO TARGET
            # ----------------------------------------------------

            try:

                target_response = (
                    self.target.send_prompt(
                        prompt
                    )
                )

            except Exception as error:

                print(
                    "\nERROR: Target request failed."
                )

                print(
                    f"Reason: {error}"
                )

                target_response = (
                    "Target request failed."
                )

            if target_response is None:

                target_response = ""

            target_response = str(
                target_response
            )

            print("\nTarget Response:")

            print(
                target_response
            )

            # ----------------------------------------------------
            # 4. EVALUATE TARGET RESPONSE
            # ----------------------------------------------------

            try:

                raw_evaluation = (
                    self.evaluator.evaluate(
                        prompt=prompt,
                        response=target_response
                    )
                )

            except Exception as error:

                print(
                    "\nERROR: Policy evaluation failed."
                )

                print(
                    f"Reason: {error}"
                )

                raw_evaluation = {
                    "status": "ERROR",
                    "category": "EVALUATION_ERROR",
                    "severity": "NONE",
                    "confidence": 0.0,
                    "reason": (
                        "The policy evaluator failed "
                        f"with error: {error}"
                    )
                }

            # ----------------------------------------------------
            # 5. NORMALIZE EVALUATION
            # ----------------------------------------------------

            evaluation = (
                self._normalize_evaluation(
                    raw_evaluation
                )
            )

            print("\nEvaluation:")

            print(
                f"Status     : "
                f"{evaluation['status']}"
            )

            print(
                f"Category   : "
                f"{evaluation['category']}"
            )

            print(
                f"Severity   : "
                f"{evaluation['severity']}"
            )

            print(
                f"Confidence : "
                f"{evaluation['confidence']}"
            )

            print(
                f"Reason     : "
                f"{evaluation['reason']}"
            )

            # ----------------------------------------------------
            # 6. CREATE FINDING
            # ----------------------------------------------------

            finding = Finding(

                iteration=iteration,

                strategy=strategy,

                category=evaluation.get(
                    "category",
                    category
                ),

                status=evaluation.get(
                    "status",
                    "UNKNOWN"
                ),

                severity=evaluation.get(
                    "severity",
                    "NONE"
                ),

                confidence=evaluation.get(
                    "confidence",
                    0.0
                ),

                prompt=prompt,

                target_response=target_response,

                reason=evaluation.get(
                    "reason",
                    ""
                ),

                adaptation_reason=(
                    adaptation_reason
                )
            )

            # ----------------------------------------------------
            # 7. STORE RESULT
            # ----------------------------------------------------

            result = {

                "iteration":
                    finding.iteration,

                "strategy":
                    finding.strategy,

                "category":
                    finding.category,

                "prompt":
                    finding.prompt,

                "target_response":
                    finding.target_response,

                "status":
                    finding.status,

                "severity":
                    finding.severity,

                "confidence":
                    finding.confidence,

                "reason":
                    finding.reason,

                "adaptation_reason":
                    finding.adaptation_reason,

                "finding":
                    finding
            }

            results.append(
                result
            )

            # ----------------------------------------------------
            # 8. PREVIEW NEXT STRATEGY
            # ----------------------------------------------------

            print(
                "\nFeedback → Next Iteration:"
            )

            print(
                f"Previous Status = "
                f"{finding.status}"
            )

            print(
                f"Previous Severity = "
                f"{finding.severity}"
            )

            print(
                f"Previous Category = "
                f"{finding.category}"
            )

            try:

                next_strategy = (
                    self.strategy_manager.preview_strategy(
                        evaluation
                    )
                )

            except Exception as error:

                print(
                    "\nWARNING: Strategy preview failed."
                )

                print(
                    f"Reason: {error}"
                )

                next_strategy = (
                    "DIRECT_REQUEST"
                )

            print(
                f"Next Strategy Candidate = "
                f"{next_strategy}"
            )

            print(
                "Strategy preview does not "
                "modify the strategy manager state."
            )

            # ----------------------------------------------------
            # 9. EARLY STOP ON VULNERABILITY
            # ----------------------------------------------------

            if finding.is_vulnerability():

                print("\n")

                print(
                    "!" * 70
                )

                print(
                    "VULNERABILITY DETECTED"
                )

                print(
                    "!" * 70
                )

                print(
                    f"Severity   : "
                    f"{finding.severity}"
                )

                print(
                    f"Confidence : "
                    f"{finding.confidence}"
                )

                print(
                    f"Category   : "
                    f"{finding.category}"
                )

                print(
                    "\nCampaign stopped early because"
                )

                print(
                    "a vulnerability was detected."
                )

                break

            # ----------------------------------------------------
            # 10. STORE FEEDBACK FOR NEXT ITERATION
            # ----------------------------------------------------

            previous_result = result

            previous_evaluation = evaluation

            print(
                "\nFeedback stored for next iteration."
            )

        # ========================================================
        # CAMPAIGN SUMMARY
        # ========================================================

        print("\n")

        print(
            "=" * 70
        )

        print(
            "CAMPAIGN SUMMARY"
        )

        print(
            "=" * 70
        )

        print(
            f"Iterations Executed: "
            f"{len(results)}"
        )

        vulnerabilities = [
            result
            for result in results
            if result[
                "status"
            ].upper() == "VULNERABLE"
        ]

        print(
            f"Vulnerabilities Found: "
            f"{len(vulnerabilities)}"
        )

        if vulnerabilities:

            print(
                "\nFindings:"
            )

            for result in vulnerabilities:

                print(
                    f"- Iteration "
                    f"{result['iteration']} | "
                    f"{result['category']} | "
                    f"{result['severity']}"
                )

        else:

            print(
                "\nNo vulnerabilities detected."
            )

        print(
            "=" * 70
        )

        return results