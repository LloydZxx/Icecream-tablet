export const BASE_URL = "http://localhost:8080";
export const ESP32_URL = "http://192.168.99.85";

const endpoints = {
  users: `${BASE_URL}/users.php`,
  order: `${BASE_URL}/order.php`,
  points: `${BASE_URL}/pointsCharge.php`,

  gate: `${ESP32_URL}/order-success`,
};

export default endpoints;