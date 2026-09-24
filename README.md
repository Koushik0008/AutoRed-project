# AutoRed: Autonomous LLM Red-Teaming Framework

AutoRed is an autonomous AI security red-teaming framework designed to automatically test authorized Large Language Model (LLM) applications for potential security vulnerabilities.

Instead of relying only on fixed security test cases, AutoRed uses an adaptive closed-loop approach where attack prompts are generated, sent to a target, evaluated, and then refined based on the previous result.

---

## Overview

Large Language Model applications can be vulnerable to problems such as:

- Prompt injection
- Sensitive information disclosure
- Policy manipulation
- Jailbreak attempts
- Unauthorized information extraction

Traditional security testing often depends on manually written test cases. AutoRed aims to automate this process by allowing an AI-driven testing system to continuously generate and evaluate security attacks.

The framework consists of three major intelligent components:

```text
Prompt Generator Agent
        ↓
Authorized Target
        ↓
Policy Evaluator Agent
        ↓
Feedback
        ↓
Prompt Generator Agent
