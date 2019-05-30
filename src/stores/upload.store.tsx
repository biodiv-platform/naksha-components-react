import { useEffect, useState } from "react";
import { openDbf, openShp } from "shapefile";

import { FILE_TYPES } from "../utils/constants";
import {
  LICENSE_TYPE_OPTIONS,
  LAYER_TYPE_OPTIONS
} from "../components/Upload/table.constants";

export default function UploadStore() {
  const [dbfFile, setDbfFile] = useState({ file: null, meta: {} } as any);
  const [shpFile, setShpFile] = useState({ file: null, meta: {} } as any);
  const [shxFile, setShxFile] = useState({ file: null, meta: {} } as any);
  const [selectedKey, setSelectedKey] = useState("0");
  const [titleColumn, setTitleColumn] = useState();
  const [summeryColumn, setSummeryColumn] = useState();
  const [allFilesUploaded, setAllFilesUploaded] = useState(false);
  const [formData, _setFormData] = useState({
    layerType: LAYER_TYPE_OPTIONS[0].key,
    titleColumn: null,
    summeryColumns: [],
    defaultStylingColumn: null,
    layerName: null,
    layerDescription: null,
    contributor: null,
    attribution: null,
    tags: null,
    license: LICENSE_TYPE_OPTIONS[0].key,
    dataCurationDate: new Date()
  });

  const setFormData = (e, v, key?) => {
    const _k = e ? e.target.name : key;
    _setFormData({ ...formData, [_k]: v.key || v });
  };

  useEffect(
    () => {
      console.log("check");
      if (dbfFile.file && shpFile.file && shxFile.file) {
        setAllFilesUploaded(true);
      }
    },
    [dbfFile.file, shpFile.file, shxFile.file]
  );

  const _parseShp = file => {
    const readerShp = new FileReader();
    readerShp.onload = async () => {
      const sourceShp = await openShp(readerShp.result);
      setShpFile({ file, meta: (await sourceShp.read()).value });
    };
    readerShp.readAsArrayBuffer(file);
  };

  const _parseDbf = file => {
    const readerDbf = new FileReader();
    readerDbf.onload = async () => {
      const sourceDbf = await openDbf(readerDbf.result);
      const meta: any = { keys: [], headings: [], rows: [] };
      for (let i = 0; i < 5; i++) {
        const _r = (await sourceDbf.read()).value;
        if (i === 0) {
          meta.keys = Object.keys(_r);
          meta.headings = Object.keys(_r);
          meta.rows = meta.keys.reduce((o, k) => ({ ...o, [k]: [] }), {});
          _setFormData({
            ...formData,
            defaultStylingColumn: meta.keys[0],
            titleColumn: meta.keys[0]
          });
        }
        meta.keys.forEach(k => {
          meta.rows[k].push(_r[k]);
        });
      }
      setDbfFile({ file, meta });
    };
    readerDbf.readAsArrayBuffer(file);
  };

  const _parseShx = file => {
    setShxFile({ file, meta: {} });
  };

  const preProcessFiles = files => {
    files.forEach(file => {
      if (file.name.endsWith(FILE_TYPES.DBF)) {
        _parseDbf(file);
      } else if (file.name.endsWith(FILE_TYPES.SHP)) {
        _parseShp(file);
      } else if (file.name.endsWith(FILE_TYPES.SHX)) {
        _parseShx(file);
      }
    });
  };

  return {
    dbfFile,
    shpFile,
    shxFile,
    selectedKey,
    setSelectedKey,
    preProcessFiles,
    allFilesUploaded,

    titleColumn,
    setTitleColumn,
    summeryColumn,
    setSummeryColumn,

    formData,
    setFormData
  };
}
