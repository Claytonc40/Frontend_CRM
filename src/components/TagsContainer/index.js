import { Chip, Paper, TextField, Typography, CircularProgress } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useRef, useState } from "react";
import { isArray, isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

export function TagsContainer({ ticket }) {

    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const [loading, setLoading] = useState(false);
    const isMounted = useRef(true);
    const isContact = ticket && ticket.number && !ticket.protocol;

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (isMounted.current) {
            loadTags().then(() => {
                if (Array.isArray(ticket.tags)) {
                    setSelecteds(ticket.tags);
                } else {
                    setSelecteds([]);
                }
            });
        }
    }, [ticket]);

    const createTag = async (data) => {
        try {
            setLoading(true);
            const { data: responseData } = await api.post(`/tags`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        } finally {
            setLoading(false);
        }
    }

    const loadTags = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/tags/list`);
            setTags(data);
        } catch (err) {
            toastError(err);
        } finally {
            setLoading(false);
        }
    }

    const syncTags = async (data) => {
        try {
            setLoading(true);
            if (isContact) {
                // Se for um contato, usa a API de contatos
                await api.put(`/contacts/${ticket.id}`, {
                    ...ticket,
                    tags: data.tags
                });
                toast.success(i18n.t("contactDetailsModal.success"));
            } else {
                // Se for um ticket, usa a API de tags/sync
                await api.post(`/tags/sync`, data);
            }
            return true;
        } catch (err) {
            toastError(err);
            return false;
        } finally {
            setLoading(false);
        }
    }

    const onChange = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    if (isString(item)) {
                        const newTag = await createTag({ name: item })
                        optionsChanged.push(newTag);
                    } else {
                        optionsChanged.push(item);
                    }
                }
            }
            await loadTags();
        } else {
            optionsChanged = value;
        }
        setSelecteds(optionsChanged);
        
        // Sincroniza as tags com a entidade (ticket ou contato)
        const syncData = isContact 
            ? { contactId: ticket.id, tags: optionsChanged }
            : { ticketId: ticket.id, tags: optionsChanged };
            
        await syncTags(syncData);
    }

    return (
        <Paper style={{ padding: 12 }}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                    <CircularProgress size={24} />
                </div>
            ) : (
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                freeSolo
                onChange={(e, v, r) => onChange(v, r)}
                    getOptionLabel={(option) => option.name || ""}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                                key={option.id || index}
                            variant="outlined"
                            style={{
                                background: option.color || '#eee',
                                color: "#FFF",
                                marginRight: 1,
                                fontWeight: 600,
                                borderRadius: 3,
                                fontSize: "0.8em",
                                    whiteSpace: "nowrap",
                                    textShadow: "0px 1px 1px rgba(0,0,0,0.5)"
                            }}
                                label={option.name?.toUpperCase() || ""}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Tags" />
                )}
                PaperComponent={({ children }) => (
                    <Paper style={{ width: 400, marginLeft: 12 }}>
                        {children}
                    </Paper>
                )}
                    noOptionsText={<Typography>Nenhuma tag encontrada</Typography>}
            />
            )}
        </Paper>
    )
}