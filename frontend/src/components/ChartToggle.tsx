import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleFilter } from 'store/DataSelectionSlice';
import {
    Box, Button, FormControlLabel, Checkbox, FormGroup,
} from '@mui/material';
//Checkbox, FormControlLabel, FormGroup, TextField,
// 

interface ChartToggleProps {
    onclose: () => void;
}

export default function ChartToggle(props: ChartToggleProps): JSX.Element {
    const filterList = useAppSelector((state) => state.dataSelection.filter);
    const dispatch = useAppDispatch();

    const checkboxChecked = (name: string) => {
        dispatch(toggleFilter(name))
    };




    const listfilter = () => {
        if (filterList && filterList.length >= 1) {
            return (
                filterList.map((filterItem) => (
                    activefilters(filterItem.toggle as boolean, filterItem.name as string)
                ))
            );
        } else {
            return (<Box><p>Es wurden keine Filter erstellt</p></Box>);
        }
    }

    const activefilters = (filterToggle: boolean, filterName: string): JSX.Element => {
        return (<FormControlLabel control={<Checkbox onClick={() => { checkboxChecked(filterName) }} checked={filterToggle} />} label={filterName} key={filterName} />);
    };


    return (
        <Box
            sx={{

                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginRight: "2rem",
                marginLeft: "2rem",
                marginTop: "0.5rem",
            }}>
            <legend>Aktive Filter</legend>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <FormGroup>
                    {
                        listfilter()
                    }
                </FormGroup>
            </Box>
            <Box>
                <Button
                    sx={{
                        color: "red"
                    }}
                    onClick={() => { props.onclose() }}
                >
                    Schließen
                    </Button>
            </Box>

        </Box >
    );
}
