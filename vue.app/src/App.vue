<template>
	<section class="terminal">
		<nav class="terminal__nav">
			<h1>Command Prompt</h1>
		</nav>
		<main class="terminal__main">
			<p class="terminal__main-input"></p>
		</main>
	</section>
</template>

<script type="text/javascript">
	export default {
		name: "app",
	};
</script>

<style lang="scss">
	$background-color: #2b2b2b;
	$terminal-main-color: #1a1b1f;
	$terminal-nav-color: white;
	$terminal-nav-color--focused: #2c3039;

	.terminal {
		width: 90vw;
		max-width: 900px;
		height: 550px;
		background: $terminal-main-color;
		box-shadow: rgb(17, 17, 17) 0px 2px 5px;
		padding-top: 0;

		&:hover {
			background: black;

			.terminal__nav {
				background-color: $terminal-nav-color--focused;
				cursor: move;
				margin: 0;
			}
		}

		&__nav {
			height: 40px;
			display: flex;
			align-items: center;
			padding: 0 15px;
			cursor: default;
			background: $terminal-nav-color;

			h1 {
				font-size: 1rem;
				color: darken(lightgrey, 10);
			}
		}

		&__main {
			padding: 0 10px;
			font-size: 0.75rem;
			color: white;

			&-input {
				&:before {
					content: "C:\\Users\\Ryan>";
					margin-right: 3px;
				}

				&:after {
					content: "_";
					margin-left: 3px;
					animation: 1s step-end 0s infinite normal none running blink;
				}
			}
		}
	}

	@keyframes blink {
		0%,
		100% {
			background-color: white;
		}
		50% {
			background-color: transparent;
		}
	}
</style>
