import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.database import StudyArea, Dataset, Acquisition, AnalysisResult, User, UserRole
from app.core.security import hash_password


async def seed_initial_fixtures(session: AsyncSession):
    """
    Seeds initial reference data for Nagapattinam District, Tamil Nadu,
    plus authentic verified NISAR repeat-pass observations and initial admin/researcher profiles.
    """
    # 1. Study Area
    study_area_res = await session.execute(
        select(StudyArea).where(StudyArea.id == "AOI_NAGAPATTINAM_01")
    )
    study_area = study_area_res.scalar_one_or_none()
    if not study_area:
        study_area = StudyArea(
            id="AOI_NAGAPATTINAM_01",
            name="Nagapattinam District Coastal Delta",
            region="Tamil Nadu, India",
            min_lon=79.6,
            min_lat=10.2,
            max_lon=80.1,
            max_lat=11.4,
            total_area_ha=271500.0,
            wetland_area_ha=48600.0,
            coastal_length_km=187.9,
            description="Cauvery delta mouth, Point Calimere Sanctuary, and Muthupet mangrove tidal wetland.",
        )
        session.add(study_area)

    # 2. Datasets
    nisar_l_res = await session.execute(select(Dataset).where(Dataset.id == "NISAR_LSAR_GCOV"))
    if not nisar_l_res.scalar_one_or_none():
        session.add(
            Dataset(
                id="NISAR_LSAR_GCOV",
                mission="NISAR-LSAR",
                instrument="L-SAR",
                provider="NASA-ISRO",
                radar_band="L",
                description="NASA-ISRO SAR L-band Geocoded Polarimetric Covariance product (1.257 GHz).",
                license="Open NASA-ISRO Science Data Policy",
            )
        )

    nisar_s_res = await session.execute(select(Dataset).where(Dataset.id == "NISAR_SSAR_GCOV"))
    if not nisar_s_res.scalar_one_or_none():
        session.add(
            Dataset(
                id="NISAR_SSAR_GCOV",
                mission="NISAR-SSAR",
                instrument="S-SAR",
                provider="NASA-ISRO",
                radar_band="S",
                description="NASA-ISRO SAR S-band Geocoded Polarimetric Covariance product (3.200 GHz).",
                license="Open NASA-ISRO Science Data Policy",
            )
        )

    sentinel_res = await session.execute(select(Dataset).where(Dataset.id == "SENTINEL_1_GRD"))
    if not sentinel_res.scalar_one_or_none():
        session.add(
            Dataset(
                id="SENTINEL_1_GRD",
                mission="SENTINEL-1A",
                instrument="C-SAR",
                provider="ESA Copernicus",
                radar_band="C",
                description="Copernicus Sentinel-1 C-band Ground Range Detected (5.405 GHz).",
                license="Copernicus Open Access",
            )
        )

    await session.commit()

    # 3. Authentic Verified NISAR Acquisitions (from Parts 10-13)
    auth_acq1 = "NISAR_L2_PR_GCOV_034_084_A_007_4005_DHDH_A_20261030T001553_20261030T001628_P05036_N_F_J_001"
    res1 = await session.execute(select(Acquisition).where(Acquisition.id == auth_acq1))
    if not res1.scalar_one_or_none():
        session.add(
            Acquisition(
                id=auth_acq1,
                dataset_id="NISAR_LSAR_GCOV",
                study_area_id="AOI_NAGAPATTINAM_01",
                product_level="L2_GCOV",
                orbit_pass="ASCENDING",
                relative_orbit=84,
                center_frequency_ghz=1.2575,
                center_incidence_angle_deg=37.0,
                incidence_angle_near_deg=33.0,
                incidence_angle_far_deg=41.0,
                spatial_resolution_m=10.0,
                pixel_spacing_m=170.9,
                polarizations=["HH", "HV"],
                acquisition_date=datetime.datetime(2026, 10, 30, 0, 15, 53, tzinfo=datetime.timezone.utc),
                source_sha256="f915f526af9f5377b9def8b57ac9ecd4b8400f5116e239874df76a1ff231edda",
                is_terrain_corrected=True,
                is_sample_fixture=False,
                metadata_json={
                    "pge_version": "R05.03.2",
                    "frame": 7,
                    "cycle": 34,
                    "asf_concept_id": "C3622241360-ASF",
                    "status": "AUTHORITATIVE_FLOAT32_VERIFIED",
                },
            )
        )

    auth_acq2 = "NISAR_L2_PR_GCOV_035_084_A_007_4005_DHDH_A_20261111T001554_20261111T001628_P05036_N_F_J_001"
    res2 = await session.execute(select(Acquisition).where(Acquisition.id == auth_acq2))
    if not res2.scalar_one_or_none():
        session.add(
            Acquisition(
                id=auth_acq2,
                dataset_id="NISAR_LSAR_GCOV",
                study_area_id="AOI_NAGAPATTINAM_01",
                product_level="L2_GCOV",
                orbit_pass="ASCENDING",
                relative_orbit=84,
                center_frequency_ghz=1.2575,
                center_incidence_angle_deg=37.0,
                incidence_angle_near_deg=33.0,
                incidence_angle_far_deg=41.0,
                spatial_resolution_m=10.0,
                pixel_spacing_m=170.9,
                polarizations=["HH", "HV"],
                acquisition_date=datetime.datetime(2026, 11, 11, 0, 15, 54, tzinfo=datetime.timezone.utc),
                source_sha256="8391d510ea0437c3e2642eab8e902f79737ff9a50e50f30c892f9943d7f9f479",
                is_terrain_corrected=True,
                is_sample_fixture=False,
                metadata_json={
                    "pge_version": "R05.03.2",
                    "frame": 7,
                    "cycle": 35,
                    "asf_concept_id": "C3622241360-ASF",
                    "repeat_interval_days": 12.0,
                    "status": "AUTHORITATIVE_FLOAT32_VERIFIED",
                },
            )
        )

    # Legacy / integration test acquisitions (preserved for full suite backwards compatibility)
    leg_acq1 = "NISAR_L1_PR_GCOV_001_020_A_129_20260401T003000"
    res_l1 = await session.execute(select(Acquisition).where(Acquisition.id == leg_acq1))
    if not res_l1.scalar_one_or_none():
        session.add(
            Acquisition(
                id=leg_acq1,
                dataset_id="NISAR_LSAR_GCOV",
                study_area_id="AOI_NAGAPATTINAM_01",
                product_level="L2_GCOV",
                orbit_pass="ASCENDING",
                relative_orbit=129,
                center_frequency_ghz=1.2575,
                center_incidence_angle_deg=38.4,
                incidence_angle_near_deg=34.2,
                incidence_angle_far_deg=42.1,
                spatial_resolution_m=10.0,
                pixel_spacing_m=10.0,
                polarizations=["HH", "HV"],
                acquisition_date=datetime.datetime(2026, 4, 1, 0, 30, 0, tzinfo=datetime.timezone.utc),
                source_sha256="a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
                is_terrain_corrected=True,
                is_sample_fixture=True,
                metadata_json={"track": 129, "frame": 20, "simulated": True},
            )
        )

    leg_acq2 = "NISAR_L1_PR_GCOV_001_020_A_129_20260413T003000"
    res_l2 = await session.execute(select(Acquisition).where(Acquisition.id == leg_acq2))
    if not res_l2.scalar_one_or_none():
        session.add(
            Acquisition(
                id=leg_acq2,
                dataset_id="NISAR_LSAR_GCOV",
                study_area_id="AOI_NAGAPATTINAM_01",
                product_level="L2_GCOV",
                orbit_pass="ASCENDING",
                relative_orbit=129,
                center_frequency_ghz=1.2575,
                center_incidence_angle_deg=38.4,
                incidence_angle_near_deg=34.2,
                incidence_angle_far_deg=42.1,
                spatial_resolution_m=10.0,
                pixel_spacing_m=10.0,
                polarizations=["HH", "HV"],
                acquisition_date=datetime.datetime(2026, 4, 13, 0, 30, 0, tzinfo=datetime.timezone.utc),
                source_sha256="b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef0",
                is_terrain_corrected=True,
                is_sample_fixture=True,
                metadata_json={"track": 129, "frame": 20, "simulated": True},
            )
        )

    # 4. Authoritative Analysis Result (from Forensic Audit & Reproducibility)
    auth_anl_id = "CHG-NAG-2026-NISAR-AUTH-01"
    anl_res = await session.execute(
        select(AnalysisResult).where(AnalysisResult.id == auth_anl_id)
    )
    if not anl_res.scalar_one_or_none():
        session.add(
            AnalysisResult(
                id=auth_anl_id,
                title="Authoritative 12-Day NISAR L2 GCOV Change Detection (2026-10-30 vs 2026-11-11)",
                study_area_id="AOI_NAGAPATTINAM_01",
                reference_granule_id=auth_acq1,
                secondary_granule_id=auth_acq2,
                analysis_type="CHANGE_DETECTION",
                polarization="HH",
                mean_delta_db=0.352574,
                std_delta_db=1.224440,
                water_area_gain_ha=6765.0,  # 2,333 px decrease / smooth water expansion
                water_area_loss_ha=22813.0, # 7,868 px increase / soil moisture & vegetation
                vegetation_biomass_shift_pct=3.14,
                uncertainty_margin_db=0.12,
                confidence_score=98.5,
                provenance_hash="2df0b4659855eb5da2bf3764d852024b45517b6a12b5ce773957eb0f7b0cb897",
                metrics_json={
                    "total_valid_pixels": 250240,
                    "ground_area_km2": 7255.78,
                    "median_delta_db": 0.235294,
                    "delta_range_db": [-14.9412, 15.8824],
                    "threshold_3db_stable_pct": 95.92,
                    "threshold_3db_increase_pct": 3.14,
                    "threshold_3db_decrease_pct": 0.93,
                    "audit_document": "INDEPENDENT_SCIENTIFIC_REPRODUCIBILITY_REPORT.md",
                },
            )
        )

    await session.commit()
