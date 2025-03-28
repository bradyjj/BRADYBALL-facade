import { Exhibition } from "./exhibition.model";
import { ProjectImage } from "./project-model.model";

export interface Project {
    id: string;
    title: string;
    year: string;
    types: string[];
    description?: string;
    images?: ProjectImage[];
    exhibitions?: Exhibition[];
}