import {
    Input,
    Stack,
    Flex,
    Fieldset,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useAuth } from "@hooks/use-auth";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuMail, LuLock, LuLogIn } from "react-icons/lu";
import { loginSchema, type LoginDTO } from "@entities";
import { useColorModeValue } from "@ui/chakra/color-mode";
import { useToast } from "@hooks/use-toast";
import { Field } from "@ui/chakra/field";
import { InputGroup } from "@ui/chakra/input-group";
import { PasswordInput } from "@ui/chakra/password-input";
import { Button } from "@ui/chakra/button";
import { useNavigate } from "react-router-dom";

function Login() {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
    } = useForm<LoginDTO>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const navigate = useNavigate();

    const { login, error: authError, loading } = useAuth();

    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    const { showSuccess } = useToast();

    useEffect(() => {
        if (authError) {
            setError("root", { message: t('auth.login.invalid_credentials') });
        }
    }, [authError, setError, clearErrors, t]);

    const onSubmit: SubmitHandler<LoginDTO> = async (formData) => {
        const { email, password } = formData;
        const success = await login(email, password);

        if (success) {
            showSuccess(
                t('auth.login.success_title'),
                t('auth.login.success_message'),
                {
                    duration: 3000,
                    isClosable: true,
                }
            );
            navigate("/");
        }
    };

    return (
        <Flex
            minH="100svh"
            maxW="100%"
            px={[4, 0]}
            justifyContent="center"
        >
            <Fieldset.Root
                mt={20} p={4}
                size={["md", "lg"]}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                bg={bgColor}
                overflow="hidden"
                h="fit-content"
                invalid={!!errors.root?.message}
                maxW="sm"
            >
                <form onSubmit={handleSubmit(onSubmit)}>

                    <Stack mb={6}>
                        <Fieldset.Legend>{t('app.welcome')}</Fieldset.Legend>
                        <Fieldset.HelperText>
                            {t('auth.login.subtitle')}
                        </Fieldset.HelperText>
                    </Stack>

                    <Fieldset.Content mb={2}>
                        <Stack gap={5}>
                            <Field
                                label={t('auth.login.email_label')}
                                invalid={!!errors.email}
                                errorText={errors.email?.message}
                            >
                                <InputGroup w="full" startElement={<LuMail color="gray.400" />}>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        placeholder={t('auth.login.email_placeholder')}
                                        size="lg"
                                        borderRadius="md"
                                    />
                                </InputGroup>
                            </Field>

                            <Field
                                label={t('auth.login.password_label')}
                                invalid={!!errors.password}
                                errorText={errors.password?.message}
                            >
                                <InputGroup w="full" startElement={<LuLock color="gray.400" />}>
                                    <PasswordInput
                                        {...register("password")}
                                        placeholder={t('auth.login.password_placeholder')}
                                        size="lg"
                                        borderRadius="md"
                                    />
                                </InputGroup>
                            </Field>
                        </Stack>
                    </Fieldset.Content>
                    <Fieldset.ErrorText>
                        {errors.root?.message}
                    </Fieldset.ErrorText>
                    <Button
                        type="submit"
                        size="lg" w="full"
                        loading={isSubmitting || loading}
                        loadingText={t('auth.login.loading')}
                        borderRadius="md"
                        mt={5}
                    >
                        <LuLogIn />
                        {t('auth.login.submit')}
                    </Button>
                </form>
            </Fieldset.Root>
        </Flex>
    );
}

export default Login;