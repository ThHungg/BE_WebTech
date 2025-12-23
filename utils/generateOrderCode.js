export const generateOrderCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    randomPart += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return `ORD${randomPart}`;
};
