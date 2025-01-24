interface I18n {
    Blacklist: {
        name: string;
        toggle: string;
        update: string;
    };
    ChangeLog: {
        file: string;
        name: string;
    };
    ConflictDiary: {
        AutoMerge: string;
        CompleteMsg: {
            AllMerge: string;
            DeleteDup: string;
            SmartMerge: string;
            TrashDup: string;
        };
        HeadingMarkdown: string;
        fail: string;
        part1: string[];
        part2: string[];
        part3: string[];
        success: string;
    };
    ContextMenu: {
        PruneResv: string;
    };
    Create: string;
    DeReserveMenu: {
        Success: string;
        name: string;
    };
    DockReserve: {
        PopupResv: string;
        arial: string;
        collapse: string;
        emptyContent: string;
        expand: string;
        min: string;
        refresh: string;
        title: string;
    };
    InvalidDefaultNotebook: string;
    MoveMenu: {
        Move: string;
        NotLi: string;
        NotMoveDiary: string;
        VerIssue: string;
    };
    Msg: {
        PruneResv: string;
        Resv404: string;
    };
    Name: string;
    NewDay: string[];
    NewVer: string;
    Open: string;
    ReserveMenu: {
        Date404: string;
        DateInvalid: string;
        DatePast: string;
        Match: string;
        Success: string;
        Title: string;
        name: string;
    };
    SetPastDN: {
        button: {
            end: string;
            start: string;
        };
        hint: {
            end: string;
            going: string;
            initial: string;
        };
        setdate: {
            error: string;
            title: string;
        };
        thead: string[];
        title: string;
    };
    Setting: {
        AutoHandleDuplicateMethod: {
            options: {
                AllMerge: string;
                DeleteDup: string;
                None: string;
                SmartMerge: string;
                TrashDup: string;
            };
            text: string;
            title: string;
        };
        AutoOpenAfterSync: {
            text: string;
            title: string;
        };
        DefaultNotebook: {
            placeholder: string;
            text: string;
            title: string;
        };
        DisableAutoCreateOnMobile: {
            text: string;
            title: string;
        };
        EnableMove: {
            text: string;
            title: string;
        };
        EnableReserve: {
            text: string;
            title: string;
        };
        EnableResvDock: {
            text: string;
            title: string;
        };
        ExpandGutterMenu: {
            text: string;
            title: string;
        };
        HighlightResv: {
            text: string;
            title: string;
        };
        IconPosition: {
            options: {
                left: string;
                right: string;
            };
            text: string;
            title: string;
        };
        NotebookBlacklist: {
            button: string;
            text: string;
            title: string;
        };
        NotebookSort: {
            options: {
                "custom-sort": string;
                "doc-tree": string;
            };
            text: string;
            title: string;
        };
        OpenOnStart: {
            text: string;
            title: string;
        };
        PopupReserveDialog: {
            text: string;
            title: string;
        };
        ReplaceAlt5Hotkey: {
            text: string;
            title: string;
        };
        ResvEmbedAt: {
            options: {
                bottom: string;
                top: string;
            };
            text: string;
            title: string;
        };
        RetvType: {
            options: {
                embed: string;
                link: string;
                ref: string;
            };
            text: string;
            title: string;
        };
        SetPastDailyNoteAttr: {
            button: string;
            empty: string;
            text: string;
            title: string;
        };
        name: string;
        update: {
            button: string;
            text: string;
            title: string;
        };
    };
    SettingGroups: {
        dailynote: string;
        enable: string;
        interact: string;
        reservation: string;
    };
    TrashBinDocContent: string;
    UpdateAll: string;
    global_notebooks_ts: {
        invalid_notebook_id_config: string;
    };
    reserve_ts: {
        block_reservation: string;
        no_matched_date: string;
    };
    toolbar_menu_ts: {
        err_get_user_notebook: string;
    };
}
