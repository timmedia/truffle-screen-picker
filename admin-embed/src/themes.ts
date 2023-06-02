import { Theme, createTheme } from "@mui/material";
import { CSSProperties } from "react";

export type Style = {
  name: "youtube" | "twitch";
  embedStyle: CSSProperties;
  theme: Theme;
};

const defaultEmbedStyles: CSSProperties = {
  transition: "height 150ms ease",
};

export const youtubeStyle: Style = {
  name: "youtube",
  embedStyle: {
    ...defaultEmbedStyles,
    margin: "24px 0px",
    borderRadius: "12px",
    width: "100%",
  },
  theme: createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#272727",
        paper: "#272727",
      },
      primary: {
        main: "rgb(255, 255, 255)",
      },
      secondary: {
        main: "rgb(255, 147, 192)",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 50,
            boxShadow: ["none"],
            ":hover": {
              boxShadow: ["none"],
            },
            textTransform: "none",
          },
          startIcon: {
            paddingLeft: "5px",
          },
        },
      },
      MuiButtonGroup: {
        styleOverrides: {
          root: {
            boxShadow: ["none"],
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            padding: "8px 0px",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontSize: "14px",
            padding: 12,
            "&.Mui-selected": {
              // color: "black",
              // background: "white",
              // borderRadius: "4px",
            },
          },
        },
      },
    },
  }),
};

export const twitchStyle: Style = {
  name: "twitch",
  embedStyle: {
    ...defaultEmbedStyles,
    margin: "10px auto",
    width: "calc(100% - 4rem)",
    maxWidth: "1200px",
    borderRadius: "4px",
  },
  theme: createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#0E0E10",
        paper: "rgb(24, 24, 27)",
      },
      primary: {
        main: "rgb(145, 71, 255)",
        light: "rgb(191, 148, 255)",
      },
      secondary: {
        main: "rgb(191, 148, 255)",
      },
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            padding: "5px 10px",
            fontSize: 13,
            boxShadow: ["none"],
            ":hover": {
              boxShadow: ["none"],
            },
            textTransform: "none",
            fontWeight: "bold",
          },

          startIcon: {
            paddingLeft: "5px",
          },
        },
      },
      MuiButtonGroup: {
        styleOverrides: {
          root: {
            boxShadow: ["none"],
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            padding: "8px 0px",
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            paddingTop: 20,
            paddingBottom: 24,
            borderBottom: "none",
            height: "100%",
            minHeight: "auto",
            fontFamily:
              "'Roobert', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          },
          flexContainer: {
            flexDirection: "row",
            justifyContent: "flex-start",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: "bolder",
            fontSize: "18px",
            color: "white",
            "&.Mui-selected": {
              color: "rgb(191, 148, 255)",
            },
            width: "auto",
            minWidth: "0px",
            padding: "0rem",
            margin: "0 1rem 0 0",
            flexBasis: "auto",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: "rgb(24, 24, 27)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: ["none"],
          },
        },
      },
    },
  }),
};
