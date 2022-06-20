import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteGroup, addGroup, group } from 'store/DataSelectionSlice';
import {
    Box, Button, Checkbox, FormControlLabel, FormGroup, TextField, ListItem, IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface CreateFilterProps {
    onclose: () => void;
}

export default function CreateFilter(props: CreateFilterProps): JSX.Element {
    const groupList = useAppSelector((state) => state.dataSelection.groups);
    const [err, raiseError] = React.useState(false);
    const [errText, setErrText] = React.useState("");

    const dispatch = useAppDispatch();
    const tempAge = [] as Array<string>;
    const tempGender = [] as Array<string>;
    const [currentName, setCurrentName] = React.useState("");


    const checkboxChecked = (type: string, id: string) => {
        if (type == "age") {
            if (tempAge.includes(id)) {
                tempAge.splice(tempAge.indexOf(id), 1);
            }
            else {
                tempAge.push(id);
            }
        }
        else if (type == "gender") {
            if (tempGender.includes(id)) {
                tempGender.splice(tempGender.indexOf(id), 1);
            }
            else {
                tempGender.push(id);
            }
        }
    };

    const groupName = (name: string) => {
        setCurrentName(name);
        raiseError(false);
        setErrText("");
    };

    const createGroup = () => {

        const groupNames = Array<string>();
        if (groupList) {
            for (let i = 0; i < groupList.length; i++) {
                groupNames.push(groupList[i].name as string);
            }
        }
        if (groupNames.includes(currentName)) {
            raiseError(true);
            setErrText("Gruppenname existiert bereits.");
        }
        else if (currentName == "") {
            raiseError(true);
            setErrText("Gruppe braucht einen Namen");
        }
        else {
            const tempGroup: group = {
                name: currentName,
                age: { ...tempAge },
                gender: { ...tempGender },
                toggle: true,
                testData: Math.random() + 0.5,
            };
            dispatch(addGroup(tempGroup));
        }
    };

    const delGroup = (name: string | null) => {
        if (name) {
            dispatch(deleteGroup(name));
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column"
            }}
        >

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: "1rem"
                }}
            >

                <TextField
                    onChange={(event) => { groupName(event.target.value) }}
                    id="TextFieldGroupName"
                    size="small"
                    label="Gruppenname"
                    variant="outlined"
                    name="testtt"
                    error={err}
                    helperText={errText}
                />

            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignSelf: "center",
                }}
            >

                <Box
                    sx={{
                        width: "80%",
                        display: "flex",
                        flexDirection: "row",
                        paddingTop: "1rem",
                        paddingLeft: "1rem",
                    }}
                >

                    <Box
                        sx={{
                            flexGrow: "1"
                        }}
                    >
                        <legend>Altersgruppen</legend>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox onClick={() => { checkboxChecked("age", "0-10") }} />} label="unter 10" />
                            <FormControlLabel control={<Checkbox onClick={() => { checkboxChecked("age", "10-20") }} />} label="10-20" />
                            <FormControlLabel control={<Checkbox onClick={() => { checkboxChecked("age", "20-30") }} />} label="20-30" />
                            <FormControlLabel control={<Checkbox onClick={() => { checkboxChecked("age", "30-50") }} />} label="30-50" />
                            <FormControlLabel control={<Checkbox onClick={() => { checkboxChecked("age", "50-80") }} />} label="50-80" />
                            <FormControlLabel control={<Checkbox onClick={() => { checkboxChecked("age", "über 80") }} />} label="über 80" />
                        </FormGroup>
                    </Box>
                    <Box
                        sx={{
                            flexGrow: "1"
                        }}
                    >
                        <legend>Geschlecht</legend>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox onClick={() => { checkboxChecked("gender", "Männlich") }} />} label="Männlich" />
                            <FormControlLabel control={<Checkbox onClick={() => { checkboxChecked("gender", "Weiblich") }} />} label="Weiblich" />
                        </FormGroup>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: "20%",
                    }}
                >


                    {
                        groupList?.map((groupItem, i) => (
                            <ListItem
                                key={i}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => delGroup(groupItem.name)} >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                {groupItem.name}
                            </ListItem>
                        ))
                    }
                </Box>
            </Box>
            <Box
                sx={{

                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Button
                    sx={{
                        color: "red"
                    }}
                    onClick={() => { props.onclose() }}
                >
                    Schließen
                    </Button>

                <Button
                    onClick={() => { createGroup() }}>
                    Filter erstellen
                    </Button>
            </Box>

        </Box >
    );
}
