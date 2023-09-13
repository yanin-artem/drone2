import axios from "axios";

const addUser = async (name: string, time: number, teamId: number) => {
  return axios.post("https://dron-game-server.start.1t.ru/api/teams/users", {
    name: name,
    time: time,
    teamId: teamId,
  });
};

const getUsersTop = async () => {
  return axios.get("https://dron-game-server.start.1t.ru/api/teams/top");
};
export const playersApi = {
  addUser,
  getUsersTop,
};
