import axios from "axios";

const payload = {
  message: "move buy button below the main heading",
  layout: {
    rootNodes: ["artboard_1"],
    nodes: {
      artboard_1: {
        id: "artboard_1",
        type: "artboard",
        width: 1080,
        height: 1080,
        children: ["headline", "cta", "badge"]
      },

      headline: {
        id: "headline",
        type: "text",
        parentId: "artboard_1",
        x: 100,
        y: 100,
        width: 400,
        height: 80,
        nx: 0.09,
        ny: 0.09,
        nw: 0.37,
        nh: 0.07,
        fontSizeRatio: 0.04,
        style: {
          visual: {
            fontSize: 48
          }
        },
        data: {
          content: "Luxury Comfort"
        }
      },

      cta: {
        id: "cta",
        type: "text",
        parentId: "artboard_1",
        x: 150,
        y: 500,
        width: 250,
        height: 60,
        nx: 0.13,
        ny: 0.46,
        nw: 0.23,
        nh: 0.05,
        fontSizeRatio: 0.025,
        style: {
          visual: {
            fontSize: 28
          }
        },
        data: {
          content: "Buy Now"
        }
      },

      badge: {
        id: "badge",
        type: "shape",
        parentId: "artboard_1",
        x: 900,
        y: 100,
        width: 120,
        height: 120,
        nx: 0.83,
        ny: 0.09,
        nw: 0.11,
        nh: 0.11
      }
    }
  },
  history: [],
  redoHistory: []
};

async function run() {
  try {
    console.log("Sending request...");

    const res = await axios.post(
      "http://localhost:3001/api/chat",
      payload
    );

    console.dir(res.data, { depth: null });

  } catch (err) {
    console.error(
      err.response?.data || err.message
    );
  }
}

run();