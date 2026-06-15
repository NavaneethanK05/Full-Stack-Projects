from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

class Request(BaseModel):
    input_text: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="The user's message/question"
    )

    @field_validator('input_text')
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        """Strip leading/trailing whitespace from input"""
        return v.strip()


class Response(BaseModel):
    response: str = Field(
        ...,
        description="The assistant's response"
    )
    sources: Optional[List[str]] = Field(
        default=None,
        description="Optional list of source URLs used"
    )
    