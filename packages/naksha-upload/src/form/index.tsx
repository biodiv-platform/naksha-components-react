import {
  Box,
  Button,
  FormLabel,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { formatDate, LICENSES, useT } from "@ibp/naksha-commons";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import useLayerUpload from "../hooks/use-layer-upload";
import { ACCESS, LAYER_TYPES } from "../icons/constants";
import DataPreview from "./data-preview";
import InputField from "./input";
import SelectMultipleField from "./multi-select";
import SelectField from "./select";
import TagsField from "./tags";
import TextareaField from "./textarea";

export default function LayerUploadForm() {
  const {
    shapeFiles: { dbf, shp },
    uploadLayer,
  } = useLayerUpload();
  const { t } = useT();

  const hForm = useForm<any>({
    resolver: yupResolver(
      yup.object().shape({
        layerName: yup.string().required(),
        layerDescription: yup.string().required(),
        layerType: yup.string().required(),
        titleColumn: yup.string().required(),
        createdBy: yup.string().required(),
        summaryColumns: yup.array().of(yup.mixed()),
        colorBy: yup.string().required(),
        attribution: yup.string().required(),
        url: yup.string().notRequired(),
        pdfLink: yup.string().notRequired(),
        tags: yup.string().required(),
        license: yup.string().required(),
        createdDate: yup.date().required(),
        downloadAccess: yup.string().required(),
        layerColumnDescription: yup
          .object()
          .shape(
            Object.fromEntries(
              dbf.meta.keys.map((k) => [k, yup.string().required()])
            )
          )
          .required(),
      })
    ),
    defaultValues: {
      layerType: shp.meta?.type?.toUpperCase(),
      layerColumnDescription: Object.fromEntries(
        dbf.meta.keys.map((k) => [k, k])
      ),
      summaryColumns: [],
    },
  });

  const handleOnSubmit = (values) => {
    uploadLayer({
      ...values,
      createdDate: formatDate(values.createdDate),
      layerFileDescription: {
        fileType: "shp",
        encoding: "UTF-8",
      },
      editAccess: "ALL",
      summaryColumns: values.summaryColumns
        .map((o) => o.value)
        .toString()
        .toLowerCase(),
    });
  };

  return (
    <FormProvider {...hForm}>
      <form onSubmit={hForm.handleSubmit(handleOnSubmit)}>
        <SimpleGrid columns={{ base: 1, md: 7 }} spacing={4} h="100%">
          <Box gridColumn="1/6" h="100%">
            <DataPreview />
            <Heading size="md" mb={4}>
              📝 {t("column_description")}
            </Heading>
            {dbf.meta.keys.map((key) => (
              <HStack spacing={4} key={key} maxW="32rem" mb={4}>
                <FormLabel w="15rem">{key}</FormLabel>
                <InputField name={`layerColumnDescription.${key}`} />
              </HStack>
            ))}
          </Box>
          <Box gridColumn="6/8" h="100%">
            <Heading size="md" mb={4}>
              🗺️ {t("layer_information")}
            </Heading>
            <Stack spacing={4}>
              <InputField name="layerName" label={t("name")} />
              <TextareaField name="layerDescription" label={t("description")} />
              <SelectField
                name="layerType"
                options={LAYER_TYPES}
                label={t("layer_type")}
              />
              <SelectField
                name="titleColumn"
                options={dbf.meta.keys}
                label={t("title_column")}
              />
              <SelectMultipleField
                name="summaryColumns"
                label={t("summary_columns")}
                options={dbf.meta.keys.map((option) => ({
                  label: option,
                  value: option,
                }))}
              />
              <SelectField
                name="colorBy"
                options={dbf.meta.keys}
                label={t("color_by")}
              />
              <InputField name="createdBy" label={t("created_by")} />
              <InputField name="attribution" label={t("attribution")} />
              <InputField name="url" label={t("url")} />
              <InputField name="pdfLink" label={t("pdf_link")} />
              <TagsField
                name="tags"
                label={t("tags")}
                hint="Press enter to add tags"
              />
              <SelectField
                name="license"
                options={Object.keys(LICENSES)}
                label={t("license")}
              />
              <InputField
                name="createdDate"
                label={t("created_date")}
                type="date"
              />
              <SelectField
                name="downloadAccess"
                options={ACCESS}
                label={t("download_access")}
              />
              <Button colorScheme="blue" type="submit">
                {t("create")}
              </Button>
            </Stack>
          </Box>
        </SimpleGrid>
      </form>
    </FormProvider>
  );
}
