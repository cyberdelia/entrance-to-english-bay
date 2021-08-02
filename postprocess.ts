import { readCSV } from "https://deno.land/x/flat@0.0.11/mod.ts";
import {
  DataItem,
  stringify,
} from "https://deno.land/std@0.92.0/encoding/csv.ts";

const filename = Deno.args[0];

const tsv = await readCSV(filename, {
  separator: " ",
  skipFirstRow: true,
  trimLeadingSpace: true,
  parse: (row: any) => {
    return {
      date: `${row["#YY"]}-${row["MM"]}-${row["DD"]}T${row["hh"]}:${
        row["mm"]
      }:00Z`,
      "wind direction": row["WDIR"],
      "wind speed": row["WSPD"],
      "gust speed": row["GST"],
      "wave height": row["WVHT"],
      "dominant wave period": row["DPD"],
      "water temperatur": row["WTMP"],
    };
  },
});

tsv.shift();

async function writeCSV(
  path: string,
  data: Record<string, unknown>[] | string,
  options?: Deno.WriteFileOptions,
) {
  if (typeof data === "string") {
    await Deno.writeTextFile(path, data, options);
    return;
  }

  const headers = Object.keys(data[0]);
  // we have to stringify the data with a row header
  const dataString = await stringify(data as DataItem[], headers);

  await Deno.writeTextFile(path, dataString, options);
}

writeCSV(
  "buoy.csv",
  tsv.filter((row) => {
    return row["wave height"] != "MM";
  }),
);
