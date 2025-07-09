// src/app/utils/surveyStatusUtils.ts

export interface SurveyStatusData {
  total_survei: number;
  completed_survei: number;
  completion_percentage: number;
  status: string;
  status_text: string;
}

/**
 * Determines survey completion status based on completion percentage
 * @param completedSurvei - Number of completed surveys
 * @param totalSurvei - Total number of surveys
 * @returns Status string (tinggi, sedang, rendah, kosong)
 */
export function determineSurveyStatus(completedSurvei: number, totalSurvei: number): string {
  if (totalSurvei === 0) return "kosong";
  
  const percentage = (completedSurvei / totalSurvei) * 100;
  
  if (percentage >= 80) return "tinggi";
  if (percentage >= 50) return "sedang";
  return "rendah";
}

/**
 * Gets human-readable status text
 * @param status - Status string from determineSurveyStatus
 * @returns Human-readable status text
 */
export function getStatusText(status: string): string {
  switch (status) {
    case "tinggi":
      return "Tinggi";
    case "sedang":
      return "Sedang";
    case "rendah":
      return "Rendah";
    case "kosong":
      return "Kosong";
    default:
      return "Tidak Diketahui";
  }
}

/**
 * Gets status color classes for UI components
 * @param status - Status string from determineSurveyStatus
 * @returns Object with background and text color classes
 */
export function getStatusColorClasses(status: string): { bg: string; text: string } {
  switch (status) {
    case "tinggi":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "sedang":
      return { bg: "bg-amber-100", text: "text-amber-800" };
    case "rendah":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "kosong":
      return { bg: "bg-gray-100", text: "text-gray-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
}

/**
 * Gets Tooltip color for NextUI components
 * @param status - Status string from determineSurveyStatus
 * @returns NextUI tooltip color
 */
export function getTooltipColor(status: string): "primary" | "warning" | "danger" | "default" {
  switch (status) {
    case "tinggi":
      return "primary";
    case "sedang":
      return "warning";
    case "rendah":
      return "danger";
    default:
      return "default";
  }
}

/**
 * Calculates complete survey status data
 * @param completedSurvei - Number of completed surveys
 * @param totalSurvei - Total number of surveys
 * @returns Complete survey status data object
 */
export function calculateSurveyStatus(completedSurvei: number, totalSurvei: number): SurveyStatusData {
  const completion_percentage = totalSurvei > 0 ? Math.round((completedSurvei / totalSurvei) * 100) : 0;
  const status = determineSurveyStatus(completedSurvei, totalSurvei);
  const status_text = getStatusText(status);

  return {
    total_survei: totalSurvei,
    completed_survei: completedSurvei,
    completion_percentage,
    status,
    status_text
  };
}

/**
 * Fetches survey summary data for a specific KIP
 * @param kip - KIP number to fetch data for
 * @returns Promise with survey summary data
 */
export async function fetchSurveyDataByKip(kip: string): Promise<SurveyStatusData | null> {
  try {
    const response = await fetch(`/api/riwayat-survei/by-kip?kip=${encodeURIComponent(kip)}`);
    const data = await response.json();

    if (data.success && data.summary) {
      const { total_survei, selesai } = data.summary;
      return calculateSurveyStatus(selesai, total_survei);
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching survey data by KIP:", error);
    return null;
  }
}

/**
 * Creates tooltip text for survey status
 * @param statusData - Survey status data
 * @returns Tooltip text string
 */
export function createTooltipText(statusData: SurveyStatusData): string {
  if (statusData.status === "kosong") {
    return "Tidak ada riwayat survei";
  }
  
  return `${statusData.completion_percentage}% survei selesai (${statusData.completed_survei}/${statusData.total_survei})`;
}

/**
 * Validates survey status data
 * @param data - Data to validate
 * @returns Boolean indicating if data is valid
 */
export function isValidSurveyData(data: any): data is SurveyStatusData {
  return (
    data &&
    typeof data.total_survei === "number" &&
    typeof data.completed_survei === "number" &&
    typeof data.completion_percentage === "number" &&
    typeof data.status === "string" &&
    typeof data.status_text === "string"
  );
}