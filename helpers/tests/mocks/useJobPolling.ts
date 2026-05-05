import { vi } from "vitest";
import { JOB_STATUS } from "@/helpers/const";
import { useJobPolling } from "@/hooks/useJobPolling";

const resetJobMock = vi.fn();

const createJobPolling = () => ({
  jobState: {
    status: "",
    progress: 0,
    logs: ["logfile.log"],
  },
  elementRef: { current: null },
  resetJob: resetJobMock,
});

const createDoneJobPollingResponse = () => {
  const response = createJobPolling();
  response.jobState.status = JOB_STATUS.DONE;
  response.jobState.progress = 100;

  return response;
};

const createPendingJobPollingResponse = () => {
  const response = createJobPolling();
  response.jobState.status = JOB_STATUS.PENDING;
  response.jobState.progress = 0;

  return response;
};

const createRunningJobPollingResponse = () => {
  const response = createJobPolling();
  response.jobState.status = JOB_STATUS.RUNNING;
  response.jobState.progress = 45;

  return response;
};

const createErrorJobPollingResponse = () => {
  const response = createJobPolling();
  response.jobState.status = JOB_STATUS.ERROR;
  response.jobState.progress = 70;

  return response;
};

const mockedUseJobPolling = vi.mocked(useJobPolling);

export const mockUseJobPolling = {
  resetJobMock,

  done: () =>
    mockedUseJobPolling.mockReturnValue(createDoneJobPollingResponse()),
  pending: () =>
    mockedUseJobPolling.mockReturnValue(createPendingJobPollingResponse()),
  running: () =>
    mockedUseJobPolling.mockReturnValue(createRunningJobPollingResponse()),
  error: () =>
    mockedUseJobPolling.mockReturnValue(createErrorJobPollingResponse()),

  custom: (
    overrides: Partial<ReturnType<typeof createDoneJobPollingResponse>>,
  ) =>
    mockedUseJobPolling.mockReturnValue({
      ...createDoneJobPollingResponse(),
      ...overrides,
    }),
};
