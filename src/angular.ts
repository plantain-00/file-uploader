import { Component, Input, Output, EventEmitter } from "@angular/core";
import * as common from "./common";
import { srcAngularTemplateHtml } from "./angular-variables";

@Component({
    selector: "file-uploader",
    template: srcAngularTemplateHtml,
})
export class FileUploaderComponent {
    @Input()
    accept?: string;
    @Input()
    multiple?: boolean;
    @Input()
    locale?: string;
    @Input()
    name?: string;
    @Input()
    url?: string;
    @Input()
    method?: string;

    @Output()
    fileGot = new EventEmitter<File | Blob>();
    @Output()
    fileUploaded = new EventEmitter<any>();

    localeObject: common.Locale;

    requests: common.UploadRequest[] = [];

    onDrop(e: DragEvent) {
        common.onDrop(e, this.name, this.url, this.method, file => {
            this.fileGot.emit(file);
        }, request => {
            this.fileUploaded.emit(request.response);
            common.removeRequest(this.requests, request);
        }, percent => {
            // nothing to do
        }, request => {
            this.requests.push(request);
        });
    }
    onPaste(e: ClipboardEvent) {
        common.onPaste(e, this.name, this.url, this.method, file => {
            this.fileGot.emit(file);
        }, request => {
            this.fileUploaded.emit(request.response);
            common.removeRequest(this.requests, request);
        }, percent => {
            // nothing to do
        }, request => {
            this.requests.push(request);
        });
    }
    onFileUploaded(e: Event) {
        common.onFileUploaded(e, this.name, this.url, this.method, file => {
            this.fileGot.emit(file);
        }, request => {
            this.fileUploaded.emit(request.response);
            common.removeRequest(this.requests, request);
        }, percent => {
            // nothing to do
        }, request => {
            this.requests.push(request);
        });
    }

    ngOnInit() {
        this.localeObject = common.getLocale(this.locale);
    }
}
