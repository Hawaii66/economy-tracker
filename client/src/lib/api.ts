type Props = {
  method: "GET";
  url: string;
};

export const makeRequest = async (settings: Props) => {
  try {
    const response = await fetch(`http://localhost:8000${settings.url}`, {
      method: settings.method,
      credentials: "include",
    });
    return response;
  } catch (e) {
    console.log(e);
    throw new Error("Something went wrong with the request");
  }
};
