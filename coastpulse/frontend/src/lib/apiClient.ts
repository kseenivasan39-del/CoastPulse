const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `API request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: unknown) {
    console.warn(`[COASTPULSE API client] ${url} error:`, err);
    throw err;
  }
}

// ------------------------------------------------------------------------------
// API Services
// ------------------------------------------------------------------------------

export const apiService = {
  // System Health
  getHealth: () => fetchFromApi<any>("/health"),

  // Geospatial & Tile Services
  inspectPixel: (lon: number, lat: number, granuleId?: string) =>
    fetchFromApi<any>(
      `/geospatial/inspect-pixel?lon=${lon}&lat=${lat}${granuleId ? `&granule_id=${granuleId}` : ""}`
    ),

  getRasterStatistics: (
    layerId: string,
    bbox?: [number, number, number, number] // [min_lon, min_lat, max_lon, max_lat]
  ) => {
    let url = `/geospatial/statistics?layer_id=${layerId}`;
    if (bbox) {
      url += `&min_lon=${bbox[0]}&min_lat=${bbox[1]}&max_lon=${bbox[2]}&max_lat=${bbox[3]}`;
    }
    return fetchFromApi<any>(url);
  },

  getOverlayUrl: (layerType: string, granuleId?: string) =>
    `${API_BASE_URL}/geospatial/render-overlay?layer_type=${layerType}${
      granuleId ? `&granule_id=${granuleId}` : ""
    }`,

  // Datasets
  getDatasets: (band?: string) =>
    fetchFromApi<any[]>(band ? `/datasets?radar_band=${band}` : "/datasets"),

  // Acquisitions
  getAcquisitions: (orbitPass?: string) =>
    fetchFromApi<any[]>(orbitPass ? `/acquisitions?orbit_pass=${orbitPass}` : "/acquisitions"),

  getAcquisition: (granuleId: string) => fetchFromApi<any>(`/acquisitions/${granuleId}`),

  // Study Areas
  getStudyAreas: () => fetchFromApi<any[]>("/study-areas"),

  // Processing Jobs
  submitJob: (data: { job_name: string; granule_id: string; algorithm: string; parameters?: any }) =>
    fetchFromApi<any>("/processing/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getJobs: () => fetchFromApi<any[]>("/processing"),

  getJob: (jobId: string) => fetchFromApi<any>(`/processing/${jobId}`),

  // Analysis & Comparisons
  verifyCompatibility: (refId: string, secId: string) =>
    fetchFromApi<any>("/comparisons/verify-compatibility", {
      method: "POST",
      body: JSON.stringify({
        reference_granule_id: refId,
        secondary_granule_id: secId,
        max_incidence_delta_deg: 2.0,
      }),
    }),

  getAnalysisResults: () => fetchFromApi<any[]>("/analysis"),

  // Reports
  generateReport: (title: string, studyAreaId: string, granuleIds: string[]) =>
    fetchFromApi<any>("/reports/generate", {
      method: "POST",
      body: JSON.stringify({
        title,
        study_area_id: studyAreaId,
        granule_ids: granuleIds,
      }),
    }),

  getReports: () => fetchFromApi<any[]>("/reports"),

  // Workspaces / AOI Management
  getWorkspaces: (token?: string) =>
    fetchFromApi<any>("/workspaces", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  createWorkspace: (
    data: { name: string; description?: string; aoi_geojson?: any; saved_granules?: string[] },
    token?: string
  ) =>
    fetchFromApi<any>("/workspaces", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    }),

  deleteWorkspace: (id: string, token?: string) =>
    fetchFromApi<any>(`/workspaces/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  // AI Assistant
  queryAssistant: (prompt: string, contextGranuleIds?: string[]) =>
    fetchFromApi<any>("/assistant/query", {
      method: "POST",
      body: JSON.stringify({
        prompt,
        context_granule_ids: contextGranuleIds,
        study_area_id: "AOI_NAGAPATTINAM_01",
      }),
    }),
};
