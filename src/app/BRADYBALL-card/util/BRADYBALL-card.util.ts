import { Injectable } from "@angular/core";

@Injectable()
export class BRADYBALLCardUtil {
    constructor() { }

    public getCssVariableValue(variableName: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    }
}