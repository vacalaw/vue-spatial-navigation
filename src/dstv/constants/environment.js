export const TOKEN = "fa3a4687-34f8-493e-badb-13a5ef791440";
export const HEADER = () => ({
  headers: {
    authorization: TOKEN, //"aa56fa8a-fd0e-4b9b-b26e-b8acb8d40e30",
  },
});

export const BASE_API = "https://ssl.dstv.com/api/cs-mobile";
export const VERSION = "v6";
export const ENV = {
  MENU: `${BASE_API}/${VERSION}/application/navigationmenu;`,
  HOME: `${BASE_API}/editorial/${VERSION}/getEditorialsForHome;productId=1b09957b-27aa-493b-a7c9-53b3cec92d63;platformId=32faad53-5e7b-4cc0-9f33-000092e85950;packageId=3e6e5480-8b8a-4fd5-9721-470c895f91e2`,
};
