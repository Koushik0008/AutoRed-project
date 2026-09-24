from dataclasses import dataclass


@dataclass
class Finding:
    """
    Represents a security finding discovered by AutoRed.
    """

    iteration: int
    strategy: str
    category: str
    status: str
    severity: str
    confidence: float
    prompt: str
    target_response: str
    reason: str

    def is_vulnerability(self):
        """
        Returns True if the finding represents
        a detected vulnerability.
        """

        return self.status == "VULNERABLE"