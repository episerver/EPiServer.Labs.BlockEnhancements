import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import axios from "axios";
import { stringify } from "querystring";

const root = document.getElementById("root") as HTMLElement;
const moduleUrl = root.dataset.epiModuleUrl;

axios.defaults.baseURL = moduleUrl;
axios.defaults.paramsSerializer = (params) => stringify(params);

ReactDOM.render(<App />, root);
