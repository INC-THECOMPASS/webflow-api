module.exports = {
  apps: [
    {
	name: 'webflow-api',
      	exec_mode: 'cluster',
      	instances: 'max', // Or a number of instances
      	script: 'bin/www',
      	args: 'start',
	env: {
		PORT: 3456
	}
    }

  ]
}
