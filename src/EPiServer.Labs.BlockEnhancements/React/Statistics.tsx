import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Typography } from "optimizely-oui";

interface StatisticsDto {
    blockInstancesCount: number;
    localBlockInstancesCount: number;
    sharedBlockInstancesCount: number;
    sharedBlocksReferencedJustOnceCount: number;
    localBlockRatio: string;
    unusedSharedBlocks: number;
    realSharedBlocks: number;
}

export function Statistics() {
    const [statistics, setStatistics] = useState<StatisticsDto>();
    const [loadingStatistics, setLoadingStatistics] = useState(false);

    useEffect(() => {
        refreshStatistics();
    }, []);

    const refreshStatistics = () => {
        setLoadingStatistics(true);
        axios.get("/LocalContentAnalyzer/GetStatistics").then(result => {
            setStatistics(result.data);
            setLoadingStatistics(false);
        });
    };

    if (loadingStatistics || !statistics) {
        return (
            <div className="root">
                <Typography type="body">Loading...</Typography>
            </div>
        );
    }

    return (
        <Card title="Blocks statistics" shadow={false} testSection="card">
            <Typography type="body">Number of blocks: {statistics.blockInstancesCount}</Typography>
            <br />
            <Typography type="body">
                Number of blocks outside `For this page/block` folder {statistics.sharedBlockInstancesCount}
            </Typography>
            <br />
            <Typography type="body">
                Number of blocks inside `For this page/block` folder {statistics.localBlockInstancesCount}
            </Typography>
            <br />
            <Typography type="body">Local blocks ratio {statistics.localBlockRatio}</Typography>
            <br />
            <Typography type="body">
                Shared blocks referenced just once (those could be moved to `For this page/block` folders){" "}
                {statistics.sharedBlocksReferencedJustOnceCount}
            </Typography>
            <br />
            <Typography type="body">Unused Shared blocks (could be removed) {statistics.unusedSharedBlocks}</Typography>
            <br />
            <Typography type="body">
                Real Shared Blocks (blocks which are used at least twice on different content items){" "}
                {statistics.realSharedBlocks}
            </Typography>
            <br />
            <Button onClick={refreshStatistics}>Refresh</Button>
        </Card>
    );
}
