const frames = [
	{
		left: "1%",
		top: "1%",
		width: "25%",
		height: "50%",
		zindex: 999,
		url: "../alerts",
		background: "red",
	},
	{
		left: "70%",
		top: "25%",
		width: "25%",
		height: "25%",
		zindex: 1000,
		url: "../eventlist",
		background: "green",
	},
	{
		left: "70%",
		top: "30%",
		width: "25%",
		height: "65%",
		zindex: 996,
		url: "https://pixel.chat/erNOlFyMIv03oPK/3e2e4231-7aa0-4c65-803d-e8f9a53d4a20?c=1",
		background: "yellow",
	},
	{
		left: "-10%",
		top: "40%",
		width: "50%",
		height: "75%",
		zindex: 995,
		url: "https://pixel.chat/erNOlFyMIv03oPK/007fe2ed-91b8-4f3a-93f7-2ed68a7f387d?c=1",
		background: "blue",
	},
]

frames.forEach(function (frame) {
	const iFrame = document.createElement("iframe");
	iFrame.setAttribute("src", frame.url);
	iFrame.style.left = frame.left;
	iFrame.style.top = frame.top;
	iFrame.style.width = frame.width;
	iFrame.style.height = frame.height;
	iFrame.style.zIndex = frame.zindex;
	iFrame.style.padding = 0;
	iFrame.style.margin = 0;
	// iFrame.style.backgroundColor = frame.background;
	// iFrame.style.borderWidth = 1;

	const container = document.getElementById("container");
	container.appendChild(iFrame);
})

