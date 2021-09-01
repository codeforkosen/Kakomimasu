viewer-cache :
	deno cache --import-map ./pages/import-map.json --config ./pages/tsconfig.json ./pages/route.tsx

viewer-cache-r :
	deno cache -r --import-map ./pages/import-map.json --config ./pages/tsconfig.json ./pages/route.tsx
