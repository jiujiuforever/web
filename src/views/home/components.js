let components = {
    // baseData
    baseData: () =>
        import ("@/views/baseData"),
    clientManage: () =>
        import ("@/views/baseData/clientManage"),
    companyManage: () =>
        import ("@/views/baseData/companyManage"),

    //businessConfig
    businessConfig: () =>
        import ("@/views/businessConfig"),
    userManage: () =>
        import ("@/views/businessConfig/userManage"),
    scoreItem: () =>
        import ("@/views/businessConfig/scoreItem"),
    clientChange: () =>
        import ("@/views/businessConfig/clientChange"),

    // systemManage
    systemManage: () =>
        import ("@/views/systemManage"),
    enumManage: () =>
        import ("@/views/systemManage/enumManage"),
    systemStatistics: () =>
        import ("@/views/systemManage/systemStatistics"),
    dateManage: () =>
        import ("@/views/systemManage/dateManage"),
    // myWork
    myWork: () =>
        import ("@/views/myWork"),
    scoreInput: () =>
        import ("@/views/myWork/scoreInput"),
    scoreReport: () =>
        import ("@/views/myWork/scoreReport"),
    appealList: () =>
        import ("@/views/myWork/appealList"),
    scoreDetail: () =>
        import ("@/views/myWork/scoreDetail")
};

components = Object.assign(components);

export default components;