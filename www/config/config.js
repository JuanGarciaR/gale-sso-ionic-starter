angular.module("config", []).constant("GLOBAL_CONFIGURATION",
{
    application:
    {
        environment: "prd",
        language: "es",
        home: "app/home"
    },

    localstorageStamps:
    {
        personal_data: "$_personal_data",
        new_version: "$_new_version"
    }
});
