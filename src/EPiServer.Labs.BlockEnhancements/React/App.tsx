import React, { useState } from "react";
import { Input, Typography } from "optimizely-oui";
import "optimizely-oui/dist/styles.css";
import "./global.scss";
import { Statistics } from "./Statistics";
import { List } from "./List";

export default function App() {
    const [searchText, setSearchText] = useState("");
    const [maxItemsToDisplay, setMaxItemsToDisplay] = useState(50);

    return (
        <div className="root">
            <Statistics />
            <Typography type="header2">
                List of shared blocks that can be converted (top {maxItemsToDisplay})
            </Typography>
            <div className="inputs">
                <Input
                    id="search-phrase"
                    displayError={false}
                    isFilter={false}
                    isOptional={false}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Enter search phrase"
                    label="Search phrase"
                    type="text"
                    className="search-box"
                />
                <Input
                    id="items-count"
                    displayError={false}
                    isFilter={false}
                    isOptional={false}
                    value={maxItemsToDisplay}
                    min={1}
                    max={200}
                    maxLength={3}
                    onChange={e => setMaxItemsToDisplay(e.target.value)}
                    placeholder="Enter items count"
                    label="Items count"
                    type="number"
                    className="items-count"
                />
            </div>
            <List searchText={searchText} maxItemsToDisplay={maxItemsToDisplay} />
        </div>
    );
}
