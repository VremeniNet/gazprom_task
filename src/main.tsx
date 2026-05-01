import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme, presetGpnDefault } from '@consta/uikit/Theme'

import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Theme preset={presetGpnDefault}>
			<App />
		</Theme>
	</StrictMode>,
)
