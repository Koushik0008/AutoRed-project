class AttackStrategyManager:
    """
    Manages the security-testing strategies used by AutoRed.
    """

    def __init__(self):
        self.strategies = [
            "DIRECT_REQUEST",
            "INDIRECT_REQUEST",
            "ROLE_PLAYING",
            "CONTEXT_MANIPULATION",
            "POLICY_BOUNDARY_TEST"
        ]

        self.current_index = 0

    def get_next_strategy(self):
        """
        Return the next available testing strategy.
        """

        if self.current_index >= len(self.strategies):
            self.current_index = 0

        strategy = self.strategies[self.current_index]

        self.current_index += 1

        return strategy

    def choose_strategy(self, previous_evaluation=None):
        """
        Choose a strategy based on the previous evaluation.
        """

        if previous_evaluation is None:
            return self.get_next_strategy()

        status = previous_evaluation.get("status")
        severity = previous_evaluation.get("severity")

        if status == "VULNERABLE":
            return "POLICY_BOUNDARY_TEST"

        if severity == "HIGH":
            return "CONTEXT_MANIPULATION"

        return self.get_next_strategy()