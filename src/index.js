import React from "react";
import {createRoot} from "react-dom/client";
import App from "./App";
import CustomerDisplay from "./CustomerDisplay";
import "./styles.css";
import "./kiosk.css";

createRoot(document.getElementById("root")).render(window.location.search.includes("display=1")?<CustomerDisplay/>:<App/>);