import { Injectable } from '@nestjs/common';
import { contents } from 'cheerio/lib/api/traversing';
import { PDFExtract, PDFExtractResult } from 'pdf.js-extract';

@Injectable()
export class DocExtractService {

    private PDFExtract : PDFExtract

    constructor(){
        this.PDFExtract = new PDFExtract()
    }

    public async extract(file: Buffer, fname: string){
        let data = await this.PDFExtract.extractBuffer(file,{})
        data.filename = fname
        return data
    }

    public async combineText(pdfExtractResult : PDFExtractResult){
       let textArr = pdfExtractResult.pages.map((page) => {
            return page.content.reduce((pageText, cont) => {
                return pageText += cont.str
            }, "")
        })

        let textDoc : {docArr : string[], source : string} = {
            docArr : textArr,
            source : pdfExtractResult.filename
        } 
        return textDoc
    }
}
