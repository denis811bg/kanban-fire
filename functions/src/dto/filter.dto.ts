export interface FilterDto {
    status: string;
    createdDateRange: {
        start: string;
        end: string;
    };
}
