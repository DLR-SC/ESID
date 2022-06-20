import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleGroup } from 'store/DataSelectionSlice';
import {
    Box, Button, ListItem, IconButton,
} from '@mui/material';
//Checkbox, FormControlLabel, FormGroup, TextField,
// 
import DeleteIcon from '@mui/icons-material/Delete';

interface ChartToggleProps {
    onclose: () => void;
}

export default function ChartToggle(props: ChartToggleProps): JSX.Element {
    const groupList = useAppSelector((state) => state.dataSelection.groups);
    const dispatch = useAppDispatch();

    const checkboxChecked = (name: string) => {
        dispatch(toggleGroup(name))
    };


    return (
        <Box
            sx={{

                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}>
            <Box>

                {
                    groupList?.map((groupItem, i) => (
                        <ListItem
                            key={i}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => checkboxChecked(groupItem.name as string)} >
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            {groupItem.name}
                        </ListItem>
                    ))
                }

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
