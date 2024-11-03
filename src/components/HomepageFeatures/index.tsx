import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
	title: string;
	Svg: React.ComponentType<React.ComponentProps<"svg">>;
	description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
	{
		title: "一致的跨平台能力",
		Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
		description: (
			<>
				Rust 编写，支持各种桌面平台、移动平台和 Web。
				<br />
				“一次开发，各处运行”。
			</>
		),
	},
	{
		title: "高度自定义的界面",
		Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
		description: (
			<>
				使用 React 开发你想要的任何界面。
				<br />
				对接成熟社区的海量资源和开发人员。
			</>
		),
	},
	{
		title: "渐进式和灵活性",
		Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
		description: (
			<>对于不同的用户，提供不同的使用方式，从简单的模板到完全自定义。</>
		),
	},
	{
		title: "开源且商业友好",
		Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
		description: (
			<>
				基于 MPL-2.0 开源协议。
				<br />
				免费使用，更可以用于商业用途。
			</>
		),
	},
];

function Feature({ title, Svg, description }: FeatureItem) {
	return (
		<div className={clsx("col col--3")}>
			<div className="text--center">
				<Svg className={styles.featureSvg} role="img" />
			</div>
			<div className="text--center padding-horiz--md">
				<Heading as="h3">{title}</Heading>
				<p>{description}</p>
			</div>
		</div>
	);
}

export default function HomepageFeatures(): JSX.Element {
	return (
		<section className={styles.features}>
			<div className="container">
				<div className="row">
					{FeatureList.map((props, idx) => (
						<Feature key={idx} {...props} />
					))}
				</div>
			</div>
		</section>
	);
}
