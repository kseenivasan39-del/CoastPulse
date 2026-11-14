import pytest
from app.services.ai_advisor import (
    ConfigurableScientificAdvisor,
    OfflineDeterministicLLMAdapter,
    GroundedCitation,
)

SAMPLE_METRICS = {
    "water_area_gain_ha": 6765.0,
    "water_area_loss_ha": 22813.0,
    "mean_delta_db": 0.352,
    "std_delta_db": 1.224,
    "uncertainty_margin_db": 0.12,
    "confidence_score": 98.5,
    "provenance_hash": "2df0b4659855eb5da2bf3764d852024b45517b6a12b5ce773957eb0f7b0cb897",
}

SAMPLE_GRANULES = [
    {
        "id": "NISAR_L2_PR_GCOV_034_084_A_007_4005_DHDH_A_20261030T001553_20261030T001628_P05036_N_F_J_001",
        "band": "L",
        "frequency_ghz": 1.2575,
        "date": "2026-10-30T00:15:53Z",
        "sha256": "f915f526af9f5377b9def8b57ac9ecd4b8400f5116e239874df76a1ff231edda",
    },
    {
        "id": "NISAR_L2_PR_GCOV_035_084_A_007_4005_DHDH_A_20261111T001554_20261111T001628_P05036_N_F_J_001",
        "band": "L",
        "frequency_ghz": 1.2575,
        "date": "2026-11-11T00:15:54Z",
        "sha256": "8391d510ea0437c3e2642eab8e902f79737ff9a50e50f30c892f9943d7f9f479",
    },
]

@pytest.mark.asyncio
async def test_offline_deterministic_grounding():
    """Verifies that the offline assistant cites exact numbers and granules from context."""
    advisor = ConfigurableScientificAdvisor(active_provider="OFFLINE")
    result = await advisor.query(
        user_prompt="What changes in water and soil backscatter were detected by NISAR?",
        analysis_context=SAMPLE_METRICS,
        granules_context=SAMPLE_GRANULES,
    )

    assert result.is_offline_deterministic is True
    assert "6,765" in result.response_text
    assert "22,813" in result.response_text
    assert "NISAR_L2_PR_GCOV_034" in result.response_text
    assert len(result.citations) == 2
    assert "±0.42 dB" in result.citations[0].uncertainty
    assert result.citations[0].provenance_hash == SAMPLE_GRANULES[0]["sha256"]

@pytest.mark.asyncio
async def test_refusal_on_unavailable_evidence():
    """Verifies anti-hallucination behavior: explicit refusal when asked about targets outside the catalogue."""
    advisor = ConfigurableScientificAdvisor(active_provider="OFFLINE")
    result = await advisor.query(
        user_prompt="What is the sea ice extent in Antarctica?",
        analysis_context=SAMPLE_METRICS,
        granules_context=SAMPLE_GRANULES,
    )

    assert "UNAVAILABLE" in result.response_text
    assert "outside the active CoastPulse observation catalogue" in result.response_text
    assert result.grounding_manifest["status"] == "EVIDENCE_UNAVAILABLE"
    # Citations must be empty for unobserved targets
    assert len(result.citations) == 0

@pytest.mark.asyncio
async def test_methodology_explanation():
    """Verifies correct explanation of Refined Lee speckle filtering and log-ratio change detection."""
    advisor = ConfigurableScientificAdvisor(active_provider="OFFLINE")
    result = await advisor.query(
        user_prompt="Explain the scientific processing methodology used for NISAR GCOV products.",
        analysis_context=SAMPLE_METRICS,
        granules_context=SAMPLE_GRANULES,
    )

    assert "Gamma-Naught" in result.response_text
    assert "Refined Lee" in result.response_text
    assert "Log-ratio" in result.response_text
    assert "Safety" in result.response_text or "validation" in result.response_text
