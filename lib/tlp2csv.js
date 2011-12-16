// The [2csv](http://github.com/csvplot/2csv) plugin for the [Barth Electronics](www.barthelectronics.com) TLP file format

module.exports = {
	// The externally visible data object that will house the converted data
	data: null,
	// The simple loading converter
	load: function tlp2csv(data) {
		// Wipe the previous set of converted data clean, if not already so
		module.exports.data = null;
		// The ``state`` variable keeps track of the simple state machine used to validate the file and extract the relevant contents
		// The ``cols`` variable keeps the source column names in the correct order so the loaded data can be placed into the correct arrays
		var state = null, cols = [];
		// Convert the input buffer into a string, split it into an array of strings for each line, and then operate on a line-by-line basis
		data.toString().split('\n').forEach(function(line) {
			// If the file doesn't begin with "TLP file name" it can't be a Barth TLP file, so abort immediately, otherwise move to the ``valid`` state
			if(state == null && /^TLP file name/.test(line)) {
				state = 'valid';
			} else {
				throw new Error("Not a valid Barth TLP file!");
			}
			// If we've reached the line that begins with "Multi-leakage", we're just before the titles for the data, so move to the ``titles`` state
			if(/^Multi-leakage/.test(line)) {
				state = 'titles';
			// If in the ``titles`` state, perform some regexes to normalize the data into a single CSV line with simpler column names, then set the ``cols``
			// array to these column names and initialize the ``exports.data`` object, and move into the final ``data`` state.
			} else if(state == 'titles') {
				line = line.replace(/[ \r\n\t]/g, "");
				line = line.replace(/\)/g, "),");
				line = line.replace(/I\(SPLEAKAGE\)/g, "ILeak");
				line = line.replace(/\([^\)]*\)/g, "");
				cols = line.split(',');
				cols.forEach(function(column) {
					module.exports.data[column] = [];
				});
				state = 'data';
			// If in the ``data`` state, run some regexes to normalize the row into CSV format, then split the data into an array, parse it into doubles,
			// and push it into the correct column array
			} else if(state == 'data') {
				line = line.replace(/[\t]/g, ",");
				line = line.replace(/[ ]+/g, ",");
				line.split(',').forEach(function(value, index) {
					module.exports.data[cols[index]].push(parseFloat(value));
				});
			}
		});
	}
}
