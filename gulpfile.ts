// import series from 'gulp'
import { rollup } from "rollup";
import { serviceConfig, clientConfig } from "./rollup.config";

interface TaskFunc {
	(cb: () => void): void;
}

export const build: TaskFunc = async cb => {
	[serviceConfig, clientConfig].forEach(async config => {
		const inputOptions = {
			input: config.input,
			external: config.external,
			plugins: config.plugins,
		};
		const outputOptions = config.output;
		const bundle = await rollup(inputOptions);

		// 写入需要遍历输出配置
		if (Array.isArray(outputOptions)) {
			outputOptions.forEach(async outOption => {
				await bundle.write(outOption);
			});
			cb();
			console.log("Rollup built successfully");
		}
	});
};
