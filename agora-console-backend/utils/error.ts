
export const processError = (err) => {
  if (err.response && err.response.data) {
    return JSON.stringify(err.response.data);
  }
  return err.message;
};
