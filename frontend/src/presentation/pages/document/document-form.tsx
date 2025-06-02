import { useRef, useEffect, useCallback, type RefObject } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  CardBody,
  CardHeader,
  CardRoot,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Stack,
  Text,
  useBreakpointValue,
  createListCollection,
  Table,
  Input,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from '@i18n';
import { LuArrowLeft, LuPlus, LuTrash } from 'react-icons/lu';

import { LoadingSpinner } from '@ui/loading-spinner';
import { documentSchema, DocumentType, type DocumentDTO, type DocumentLineDTO } from '@entities';

import { TextField } from '@ui/field/text-field';
import { TextareaField } from '@ui/field/text-area-field';
import { SelectField } from '@ui/field/select-field';
import { Field } from '@ui/chakra/field';
import { NumberInputField, NumberInputRoot } from '@ui/chakra/number-input';
import { Button } from '@ui/chakra/button';
import { ensureIdArray, getFirstId } from '@utils/id-helper';
import { useDocuments } from '@hooks/use-documents';
import { numberToWords } from '@utils/number-to-words';

const documentFormSchema = documentSchema.extend({
  lines: z.array(
    z.object({
      id: z.number().optional(),
      designation: z.string().min(1, { message: 'validation.document_line.designation_required' }),
      reference: z.string().nullable(),
      quantity: z.coerce.number().positive({ message: 'validation.document_line.quantity_positive' }),
      unit_price: z.coerce.number().nonnegative({ message: 'validation.document_line.unit_price_nonnegative' }),
      total_price: z.coerce.number().nonnegative({ message: 'validation.document_line.total_price_nonnegative' }),
    })
  ).min(1, { message: 'validation.document.lines_required' }),
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

const documentTypeOptions = createListCollection({
  items: [
    { label: 'Facture', value: DocumentType.INVOICE },
    { label: 'Devis', value: DocumentType.ESTIMATE },
  ],
});

const DocumentForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue([true, null, null, false]);
  const contentRef = useRef<HTMLDivElement>(null);
  const { id: documentId } = useParams<{ id: string }>();
  const isEditMode = !!documentId;

  const {
    fetchDocumentByIdRequest,
    createDocumentRequest,
    updateDocumentRequest
  } = useDocuments();

  const {
    execute: fetchDocumentById,
    data: document,
    isLoading: isLoadingDocument,
    error: fetchDocumentByIdError
  } = fetchDocumentByIdRequest;

  const {
    execute: createDocument,
    isLoading: isLoadingDocumentCreate,
    error: createDocumentError
  } = createDocumentRequest;

  const {
    execute: updateDocument,
    isLoading: isLoadingDocumentUpdate,
    error: updateDocumentError
  } = updateDocumentRequest;

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      type: [DocumentType.INVOICE],
      reference: `001/${(new Date()).getFullYear()}`,
      client_name: '',
      client_address: null,
      client_phone: '+237 6',
      client_niu: null,
      client_rc: null,
      notes: null,
      total_ht: 0,
      amount_words: null,
      date_document: (new Date()).toISOString().split('T')[0],
      lines: [{ designation: '', reference: null, quantity: 1, unit_price: 0, total_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const lines = watch('lines');

  useEffect(() => {
    if (documentId && isEditMode) {
      fetchDocumentById(Number(documentId));
    }
  }, [documentId]);

  useEffect(() => {
    if (isEditMode && document) {
      reset({
        ...document,
        type: ensureIdArray(document.type),
        lines: document.document_line.length > 0
          ? document.document_line
          : [{ designation: '', reference: null, quantity: 1, unit_price: 0, total_price: 0 }],
      });
    }
  }, [isEditMode, document, reset]);

  const calculateLineTotal = useCallback((lineIndex: number) => {
    const line = lines[lineIndex];
    if (line && line.quantity && line.unit_price) {
      const total = line.quantity * line.unit_price;
      setValue(`lines.${lineIndex}.total_price`, total);
    }
  }, [lines, setValue]);

  const calculateDocumentTotal = useCallback(() => {
    const total = lines?.reduce((sum, line) => sum + (line.total_price || 0), 0) || 0;
    setValue('total_ht', Math.round(total));
    setValue('amount_words', numberToWords(Math.round(total)).toLocaleUpperCase() + ' FCFA');
  }, [lines, setValue]);

  const addLine = () => {
    append({ designation: '', reference: null, quantity: 1, unit_price: 0, total_price: 0 });
  };

  const handleFormSubmit = async (data: DocumentFormData) => {

    const documentLines: DocumentLineDTO[] = data.lines.map((line) => ({
      designation: line.designation,
      reference: line.reference,
      quantity: line.quantity,
      unit_price: line.unit_price,
      total_price: line.total_price,
    }));

    const documentType = getFirstId(data.type);

    if (!documentType) throw Error(t('documents.form.type_missing'));

    const documentData: DocumentDTO = {
      type: documentType as DocumentType,
      reference: data.reference,
      client_name: data.client_name,
      client_address: data.client_address,
      client_phone: data.client_phone,
      client_niu: data.client_niu,
      client_rc: data.client_rc,
      notes: data.notes,
      total_ht: data.total_ht,
      amount_words: data.amount_words,
      date_document: data.date_document,
      document_line: documentLines,
    };

    if (isEditMode) {
      await updateDocument({
        id: Number(documentId),
        document: documentData,
      });
      navigate(`/documents/${documentId}`);
    } else {
      const result = await createDocument(documentData);
      navigate(`/documents/${result.id}`);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate('/documents');
    } else {
      navigate(-1);
    }
  };

  if (isLoadingDocument) {
    return <LoadingSpinner />;
  }

  if (fetchDocumentByIdError || createDocumentError || updateDocumentError) {
    return (
      <Box maxW="container.xl" mx="auto">
        <Text color="red.500">{fetchDocumentByIdError?.message || createDocumentError?.message || updateDocumentError?.message}</Text>
      </Box>
    );
  }

  return (
    <Box maxW="container.xl" mx="auto" ref={contentRef}>
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <LuArrowLeft />
          </Button>
          <Heading as="h1" size="lg">
            {!isEditMode ? t('documents.create.title') : t('documents.edit.title')}
          </Heading>
        </Flex>
      </Flex>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack gap={4}>
          <Flex gap={4} direction={['column', null, null, 'row']}>
            <CardRoot size="sm" flex={1}>
              <CardHeader>
                <Heading size="md">
                  {!isEditMode ? t('documents.create.general_info') : t('documents.edit.general_info')}
                </Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="1fr" gap={4}>
                  <GridItem>
                    <SelectField
                      field={{
                        name: 'type',
                        label: t('documents.fields.type'),
                        options: documentTypeOptions,
                        required: true,
                        contentRef: contentRef as RefObject<HTMLElement>,
                        type: 'select',
                      }}
                      control={control}
                      errors={errors}
                    />
                  </GridItem>
                  <GridItem>
                    <TextField
                      field={{
                        name: 'reference',
                        label: t('documents.fields.reference'),
                        placeholder: t('documents.fields.reference'),
                        required: true,
                        type: 'text',
                      }}
                      register={register}
                      errors={errors}
                    />
                  </GridItem>
                  <GridItem>
                    <TextField
                      field={{
                        name: 'date_document',
                        label: t('documents.fields.date'),
                        type: 'date',
                        required: true,
                      }}
                      register={register}
                      errors={errors}
                    />
                  </GridItem>
                </Grid>
              </CardBody>
            </CardRoot>
            <CardRoot size="sm" flex={[1, null, null, 1.8]}>
              <CardHeader>
                <Heading size="md">
                  {!isEditMode ? t('documents.create.client_info') : t('documents.edit.client_info')}
                </Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={['1fr', null, null, '1fr 1fr']} gap={4}>
                  <GridItem>
                    <TextField
                      field={{
                        name: 'client_name',
                        label: t('documents.fields.client_name'),
                        placeholder: t('documents.fields.client_name'),
                        required: true,
                        type: 'text',
                      }}
                      register={register}
                      errors={errors}
                    />
                  </GridItem>
                  <GridItem>
                    <TextField
                      field={{
                        name: 'client_address',
                        label: t('documents.fields.client_address'),
                        placeholder: t('documents.fields.client_address'),
                        type: 'text',
                        required: true,
                      }}
                      register={register}
                      errors={errors}
                    />
                  </GridItem>
                  <GridItem>
                    <TextField
                      field={{
                        name: 'client_phone',
                        label: t('documents.fields.client_phone'),
                        placeholder: t('documents.fields.client_phone'),
                        type: 'text',
                      }}
                      register={register}
                      errors={errors}
                    />
                  </GridItem>
                  <GridItem>
                    <TextField
                      field={{
                        name: 'client_niu',
                        label: t('documents.fields.client_niu'),
                        placeholder: t('documents.fields.client_niu'),
                        type: 'text',
                      }}
                      register={register}
                      errors={errors}
                    />
                  </GridItem>
                  <GridItem>
                    <TextField
                      field={{
                        name: 'client_rc',
                        label: t('documents.fields.client_rc'),
                        placeholder: t('documents.fields.client_rc'),
                        type: 'text',
                      }}
                      register={register}
                      errors={errors}
                    />
                  </GridItem>
                </Grid>
              </CardBody>
            </CardRoot>
          </Flex>

          <CardRoot size="sm">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">
                  {!isEditMode ? t('documents.create.items') : t('documents.edit.items')}
                </Heading>
                <Button size="sm" onClick={addLine}>
                  <LuPlus />
                  {!isEditMode ? t('documents.create.add_line') : t('documents.edit.add_line')}
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              {errors.lines && typeof errors.lines.message === 'string' && (
                <Text color="red" mb={4}>{t(errors.lines.message)}</Text>
              )}

              {isMobile ? (
                <Stack gap={4}>
                  {fields.map((field, index) => (
                    <CardRoot key={field.id} variant="outline">
                      <CardBody>
                        <Stack gap={4}>
                          <Field
                            label={t('documents.fields.designation')}
                            errorText={
                              errors.lines?.[index]?.designation?.message &&
                              t(errors.lines[index].designation.message)
                            }
                            invalid={!!errors.lines?.[index]?.designation}
                          >
                            <Input
                              placeholder={t('documents.fields.designation')}
                              {...register(`lines.${index}.designation`, { required: true })}
                            />
                          </Field>

                          <Field
                            label={t('documents.fields.reference')}
                            errorText={
                              errors.lines?.[index]?.reference?.message &&
                              t(errors.lines[index].reference.message)
                            }
                            invalid={!!errors.lines?.[index]?.reference}
                          >
                            <Input
                              placeholder={t('documents.fields.reference')}
                              {...register(`lines.${index}.reference`)}
                            />
                          </Field>

                          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <GridItem>
                              <Field
                                label={t('documents.fields.quantity')}
                                errorText={
                                  errors.lines?.[index]?.quantity?.message &&
                                  t(errors.lines[index].quantity.message)
                                }
                                invalid={!!errors.lines?.[index]?.quantity}
                              >
                                <Controller
                                  name={`lines.${index}.quantity`}
                                  control={control}
                                  render={({ field }) => (
                                    <NumberInputRoot
                                      disabled={field.disabled}
                                      name={field.name}
                                      value={field.value.toString()}
                                      onValueChange={({ value }) => {
                                        field.onChange(value);
                                        calculateLineTotal(index);
                                        calculateDocumentTotal();
                                      }}
                                      min={1}
                                    >
                                      <NumberInputField onBlur={field.onBlur} />
                                    </NumberInputRoot>
                                  )}
                                />
                              </Field>
                            </GridItem>

                            <GridItem>
                              <Field
                                label={t('documents.fields.unit_price')}
                                errorText={
                                  errors.lines?.[index]?.unit_price?.message &&
                                  t(errors.lines[index].unit_price.message)
                                }
                                invalid={!!errors.lines?.[index]?.unit_price}
                              >
                                <Controller
                                  name={`lines.${index}.unit_price`}
                                  control={control}
                                  render={({ field }) => (
                                    <NumberInputRoot
                                      disabled={field.disabled}
                                      name={field.name}
                                      value={field.value.toString()}
                                      onValueChange={({ value }) => {
                                        field.onChange(value);
                                        calculateLineTotal(index);
                                        calculateDocumentTotal();
                                      }}
                                      min={0}
                                    >
                                      <NumberInputField onBlur={field.onBlur} />
                                    </NumberInputRoot>
                                  )}
                                />
                              </Field>
                            </GridItem>
                          </Grid>

                          <Field
                            label={t('documents.fields.total_price')}
                            errorText={
                              errors.lines?.[index]?.total_price?.message &&
                              t(errors.lines[index].total_price.message)
                            }
                            invalid={!!errors.lines?.[index]?.total_price}
                          >
                            <Controller
                              name={`lines.${index}.total_price`}
                              control={control}
                              render={({ field }) => (
                                <NumberInputRoot
                                  defaultValue={field.value.toString()}
                                  readOnly
                                >
                                  <NumberInputField />
                                </NumberInputRoot>
                              )}
                            />
                          </Field>

                          <Button
                            colorPalette="red"
                            variant="outline"
                            onClick={() => {
                              remove(index);
                              calculateDocumentTotal();
                            }}
                            disabled={fields.length <= 1}
                          >
                            <LuTrash />{t('documents.create.remove_line')}
                          </Button>
                        </Stack>
                      </CardBody>
                    </CardRoot>
                  ))}
                </Stack>
              ) : (
                <Box overflowX="auto">
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>{t('documents.fields.designation')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('documents.fields.reference')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('documents.fields.quantity')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('documents.fields.unit_price')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('documents.fields.total_price')}</Table.ColumnHeader>
                        <Table.ColumnHeader width="70px"></Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {fields.map((field, index) => (
                        <Table.Row key={field.id}>
                          <Table.Cell>
                            <Field
                              errorText={
                                errors.lines?.[index]?.designation?.message &&
                                t(errors.lines[index].designation.message)
                              }
                              invalid={!!errors.lines?.[index]?.designation}
                            >
                              <Input
                                placeholder={t('documents.fields.designation')}
                                {...register(`lines.${index}.designation`, { required: true })}
                                size="sm"
                              />
                            </Field>
                          </Table.Cell>
                          <Table.Cell>
                            <Field
                              errorText={
                                errors.lines?.[index]?.reference?.message &&
                                t(errors.lines[index].reference.message)
                              }
                              invalid={!!errors.lines?.[index]?.reference}
                            >
                              <Input
                                placeholder={t('documents.fields.reference')}
                                {...register(`lines.${index}.reference`)}
                                size="sm"
                              />
                            </Field>
                          </Table.Cell>
                          <Table.Cell>
                            <Field
                              errorText={
                                errors.lines?.[index]?.quantity?.message &&
                                t(errors.lines[index].quantity.message)
                              }
                              invalid={!!errors.lines?.[index]?.quantity}
                            >
                              <Controller
                                name={`lines.${index}.quantity`}
                                control={control}
                                render={({ field }) => (
                                  <NumberInputRoot
                                    disabled={field.disabled}
                                    name={field.name}
                                    value={field.value.toString()}
                                    onValueChange={({ value }) => {
                                      field.onChange(value);
                                      calculateLineTotal(index);
                                      calculateDocumentTotal();
                                    }}
                                    min={1}
                                    size="sm"
                                  >
                                    <NumberInputField onBlur={field.onBlur} />
                                  </NumberInputRoot>
                                )}
                              />
                            </Field>
                          </Table.Cell>
                          <Table.Cell>
                            <Field
                              errorText={
                                errors.lines?.[index]?.unit_price?.message &&
                                t(errors.lines[index].unit_price.message)
                              }
                              invalid={!!errors.lines?.[index]?.unit_price}
                            >
                              <Controller
                                name={`lines.${index}.unit_price`}
                                control={control}
                                render={({ field }) => (
                                  <NumberInputRoot
                                    disabled={field.disabled}
                                    name={field.name}
                                    value={field.value.toString()}
                                    onValueChange={({ value }) => {
                                      field.onChange(value);
                                      calculateLineTotal(index);
                                      calculateDocumentTotal();
                                    }}
                                    min={0}
                                    size="sm"
                                  >
                                    <NumberInputField onBlur={field.onBlur} />
                                  </NumberInputRoot>
                                )}
                              />
                            </Field>
                          </Table.Cell>
                          <Table.Cell>
                            <Field
                              errorText={
                                errors.lines?.[index]?.total_price?.message &&
                                t(errors.lines[index].total_price.message)
                              }
                              invalid={!!errors.lines?.[index]?.total_price}
                            >
                              <Controller
                                name={`lines.${index}.total_price`}
                                control={control}
                                render={({ field }) => (
                                  <NumberInputRoot
                                    disabled={field.disabled}
                                    name={field.name}
                                    value={field.value.toString()}
                                    readOnly
                                    size="sm"
                                  >
                                    <NumberInputField onBlur={field.onBlur} />
                                  </NumberInputRoot>
                                )}
                              />
                            </Field>
                          </Table.Cell>
                          <Table.Cell>
                            <IconButton
                              aria-label={t('documents.create.remove_line')}
                              colorPalette="red"
                              variant="ghost"
                              onClick={() => {
                                remove(index);
                                calculateDocumentTotal();
                              }}
                              disabled={fields.length <= 1}
                              size="sm"
                            >
                              <LuTrash />
                            </IconButton>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}

              <Flex justify="space-between" mt={4} width="full" gap={4} flexDir={['column-reverse', null, 'row']}>
                <Box w="full" maxW="sm">
                  <TextareaField
                    field={{
                      name: 'amount_words',
                      label: t('documents.fields.amount_words'),
                      placeholder: t('documents.fields.amount_words'),
                      type: 'textarea',
                      required: false,
                    }}
                    register={register}
                    errors={errors}
                  />
                </Box>
                <HStack justify="space-between">
                  <Text fontWeight="bold">{t('documents.fields.total_ht')}:</Text>
                  <Controller
                    name="total_ht"
                    control={control}
                    render={({ field }) => (
                      <NumberInputRoot
                        disabled={field.disabled}
                        name={field.name}
                        value={field.value.toString()}
                        readOnly
                        minW="200px"
                      >
                        <NumberInputField onBlur={field.onBlur} fontWeight="bold" />
                      </NumberInputRoot>
                    )}
                  />
                </HStack>
              </Flex>
            </CardBody>
          </CardRoot>

          <Flex justify="flex-end" gap={4}>
            <Button variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting || isLoadingDocumentCreate || isLoadingDocumentUpdate}>
              {!isEditMode ? t('documents.create.submit') : t('documents.edit.submit')}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Box>
  );
};

export default DocumentForm;