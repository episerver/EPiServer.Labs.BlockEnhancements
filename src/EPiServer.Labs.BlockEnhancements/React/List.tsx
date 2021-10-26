import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Typography } from "optimizely-oui";
import { Simulate } from "react-dom/test-utils";

interface ListProps {
    searchText: string;
    maxItemsToDisplay: number;
}

export function List({ searchText, maxItemsToDisplay }: ListProps) {
    const [itemsToConvert, setItemsToConvert] = useState<any[]>();
    const [loadingItems, setLoadingItems] = useState(false);

    const reloadItems = () => {
        setLoadingItems(true);
        axios
            .get(
                `/LocalContentAnalyzer/GetSharedBlocksToConvert?searchText=${searchText}&maxItemsToDisplay=${maxItemsToDisplay}`
            )
            .then(result => {
                setItemsToConvert(result.data);
                setLoadingItems(false);
            });
    };

    useEffect(() => {
        reloadItems();
    }, [searchText, maxItemsToDisplay]);

    const doConvert = (contentLink: string) => {
        return axios.post("/LocalContentAnalyzer/MoveToLocalFolder", {
            contentLink: contentLink
        });
    };

    const convert = (contentLink: string) => {
        doConvert(contentLink).then(() => {
            reloadItems();
        });
    };

    const convertAll = () => {
        if (!itemsToConvert) {
            return;
        }

        Promise.all(itemsToConvert.map(item => doConvert(item.contentLink))).then(() => {
            reloadItems();
        });
    };

    if (itemsToConvert === undefined || loadingItems) {
        return (
            <div className="root">
                <Typography type="body">Loading...</Typography>
            </div>
        );
    }

    return (
        <>
            {itemsToConvert.length !== 0 ? (
                <>
                    <Table density="tight" style="wall">
                        <Table.THead>
                            <Table.TR>
                                <Table.TH width="20%">Name</Table.TH>
                                <Table.TH width="10%">Content link</Table.TH>
                                <Table.TH width="10%">Type</Table.TH>
                                <Table.TH>Breadcrumb</Table.TH>
                                <Table.TH width="10%">Actions</Table.TH>
                            </Table.TR>
                        </Table.THead>
                        <Table.TBody>
                            {itemsToConvert.map(block => (
                                <Table.TR key={block.contentLink}>
                                    <Table.TD>
                                        <a href={block.uri} target="_blank" rel="noreferrer" title="Open link">
                                            {block.name}
                                        </a>
                                    </Table.TD>
                                    <Table.TD>{block.contentLink}</Table.TD>
                                    <Table.TD>{block.typeIdentifier}</Table.TD>
                                    <Table.TD>{block.treePath.join(" >> ")}</Table.TD>
                                    <Table.TD>
                                        <a onClick={() => convert(block.contentLink)}>Convert</a>
                                    </Table.TD>
                                </Table.TR>
                            ))}
                        </Table.TBody>
                    </Table>
                    <br />
                    <Button onClick={convertAll}>Convert all</Button>
                </>
            ) : (
                <div>
                    <Typography type="body">No items to show</Typography>
                </div>
            )}
        </>
    );
}
