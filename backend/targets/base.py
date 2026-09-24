from abc import ABC, abstractmethod


class TargetInterface(ABC):

    @abstractmethod
    def send_prompt(self, prompt: str) -> str:
        """
        Send a prompt to the target and return its response.
        """
        pass