export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  isIdealForSpraying: boolean;
}

export const getWeatherStatus = async (): Promise<WeatherData> => {
  return {
    temperature: 20,
    humidity: 60,
    windSpeed: 5,
    description: "Açık",
    isIdealForSpraying: true
  };
};