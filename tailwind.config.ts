import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		fontFamily: {
			sans: ['Poppins', 'sans-serif'],
			display: ['Gilroy', 'sans-serif'],
		},
		extend: {
			colors: {
				border: 'var(--config-border)',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'var(--config-background)',
				foreground: 'var(--config-text)',
				primary: {
					DEFAULT: 'var(--config-primary)',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'var(--config-secondary)',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'var(--config-error)',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'var(--config-accent)',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))'
				},
				chat: {
					background: 'var(--config-background)',
					surface: 'var(--config-surface)',
					'surface-hover': 'hsl(var(--chat-surface-hover))'
				},
				message: {
					user: 'hsl(var(--user-message))',
					'user-foreground': 'hsl(var(--user-message-foreground))',
					ai: 'hsl(var(--ai-message))',
					'ai-foreground': 'hsl(var(--ai-message-foreground))'
				},
				sidebar: {
					DEFAULT: 'var(--config-surface)',
					surface: 'hsl(var(--sidebar-surface))',
					'surface-hover': 'hsl(var(--sidebar-surface-hover))',
					border: 'var(--config-border)'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-surface': 'var(--gradient-surface)',
				'gradient-glow': 'var(--gradient-glow)'
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'surface': 'var(--shadow-surface)'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-slide': 'fade-in-slide 0.5s ease-out forwards',
				'wave': 'wave 1.2s infinite ease-in-out',
			},
			backdropBlur: {
				'glass': '10px',
			},
			backgroundColor: {
				'glass': 'rgba(255, 255, 255, 0.1)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
