import { Injectable } from '@nestjs/common';
import { makeReportTimeline } from 'src/common/helpers/utilityFunctions';
import { IProductReportUnit } from 'src/common/interfaces';
import { IReportProductQuery } from 'src/modules/producer/producer.interfaces';
import { IProduct, IProductLine } from '../product.interfaces';

@Injectable()
export class ProductReportService {
    constructor() {
        //
    }

    async makeProductReport(
        query: IReportProductQuery,
        products: IProduct[],
        productLines?: IProductLine[],
    ) {
        try {
            const reportTimeline = makeReportTimeline(
                query.startDate,
                query.finishDate,
                query.timeUnit,
            );

            const report: IProductReportUnit[] = reportTimeline.map((item) => ({
                time: item,
                productQuantity: {
                    total: 0,
                    // productLines: [
                    //     {
                    //         productLine: {},
                    //         quantity: 0,
                    //     },
                    // ],
                },
            }));

            // const reportLoopIndex = 0;
            // products.forEach((product) => {

            // })

            return report;
        } catch (error) {
            throw error;
        }
    }
}
